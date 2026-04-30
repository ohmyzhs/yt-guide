// Adapter: keeps the /api/gemini-generate request/response shape unchanged
// for existing callers, but executes via the local `claude` CLI instead of
// hitting Google's Gemini API. This eliminates per-token costs when the
// machine is logged in via `claude login` (uses Pro/Max subscription quota).
//
// Callers send a Gemini-style payload:
//   { payload: { contents: [{role, parts:[{text}]}], systemInstruction?, generationConfig? } }
// We translate it to a single prompt string, pipe it to `claude -p`, then
// wrap stdout in the Gemini response shape so the existing parsers keep
// working: result.candidates[0].content.parts[0].text

import { spawn } from "node:child_process";

export const runtime = "nodejs";
export const maxDuration = 300;

function payloadToPrompt(payload) {
  const out = [];

  const sys = payload?.systemInstruction?.parts
    ?.map((p) => p?.text || "")
    .filter(Boolean)
    .join("\n");
  if (sys) out.push(`<system>\n${sys}\n</system>`);

  const contents = Array.isArray(payload?.contents) ? payload.contents : [];
  for (const turn of contents) {
    const role = turn?.role === "model" ? "assistant" : "user";
    const text = (turn?.parts || [])
      .map((p) => p?.text || "")
      .filter(Boolean)
      .join("\n");
    if (!text) continue;
    out.push(`<${role}>\n${text}\n</${role}>`);
  }

  if (payload?.generationConfig?.responseMimeType === "application/json") {
    out.push(
      "<instructions>\nReturn ONLY valid JSON. Do not wrap in markdown code fences. Do not add explanation before or after.\n</instructions>",
    );
  }

  return out.join("\n\n");
}

function wrapAsGemini(text) {
  return {
    candidates: [
      {
        content: { role: "model", parts: [{ text }] },
        finishReason: "STOP",
      },
    ],
  };
}

function runClaude(prompt) {
  return new Promise((resolve) => {
    const isWin = process.platform === "win32";
    const cliBin =
      process.env.CLAUDE_BIN || (isWin ? "claude.cmd" : "claude");
    const model = process.env.CLAUDE_MODEL;
    const timeoutMs = parseInt(
      process.env.CLAUDE_GENERATE_TIMEOUT_MS || "180000",
      10,
    );

    const args = ["-p", "--output-format", "text"];
    if (model) args.push("--model", model);

    let proc;
    try {
      proc = spawn(cliBin, args, {
        shell: isWin, // .cmd on Windows requires shell; prompt is fed via stdin so no arg-injection surface
        env: process.env,
      });
    } catch (e) {
      resolve({
        ok: false,
        error: `Failed to spawn claude CLI: ${e.message}. Check CLAUDE_BIN and that 'claude' is on PATH.`,
        code: 500,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      try {
        proc.kill("SIGTERM");
      } catch {}
    }, timeoutMs);

    proc.stdout.on("data", (b) => (stdout += b.toString("utf8")));
    proc.stderr.on("data", (b) => (stderr += b.toString("utf8")));

    proc.on("error", (e) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        error: `claude CLI process error: ${e.message}`,
        code: 500,
      });
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (killed) {
        resolve({
          ok: false,
          error: `claude CLI timed out after ${timeoutMs}ms`,
          code: 504,
        });
        return;
      }
      if (code === 0) {
        resolve({ ok: true, text: stdout.trim() });
      } else {
        resolve({
          ok: false,
          error: `claude exited with code ${code}: ${stderr.trim() || "(no stderr)"}`,
          code: 502,
        });
      }
    });

    try {
      proc.stdin.write(prompt);
      proc.stdin.end();
    } catch (e) {
      clearTimeout(timer);
      try {
        proc.kill("SIGTERM");
      } catch {}
      resolve({
        ok: false,
        error: `Failed to write prompt to stdin: ${e.message}`,
        code: 500,
      });
    }
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body?.payload;
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Missing payload" }, { status: 400 });
  }

  const prompt = payloadToPrompt(payload);
  if (!prompt) {
    return Response.json(
      { error: "Empty prompt after translation" },
      { status: 400 },
    );
  }

  const result = await runClaude(prompt);
  if (!result.ok) {
    return Response.json(
      { error: "Claude CLI request failed", details: result.error },
      { status: result.code || 500 },
    );
  }

  return Response.json(wrapAsGemini(result.text));
}
