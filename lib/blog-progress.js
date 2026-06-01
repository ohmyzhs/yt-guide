// Shared model of the /blog-new pipeline's steps, inferred from which files
// have appeared in an output folder. Used by the run route (live progress +
// _run.json persistence), the result route, and the history route so the UI
// shows a consistent picture of how far a post got.

// Ordered checkpoints. Each step is "done" once its marker file exists.
// research.json is best-effort (web-fallback research may skip it), so it is
// informational only and never blocks completion.
export const STEP_FILES = [
  { step: 1, label: "리서치", file: "research.json", optional: true },
  { step: 2, label: "본문 작성", file: "post.md" },
  { step: 2, label: "본문 HTML", file: "post.html" },
  { step: 3, label: "이미지 프롬프트", file: "image-prompts.json" },
  { step: 4, label: "품질 검증", file: "quality-report.json" },
  { step: 5, label: "메타데이터", file: "metadata.json" },
  { step: 5, label: "편집 가이드", file: "guide.md" },
];

// A post is "complete" when these deliverables all exist.
const REQUIRED_FOR_COMPLETE = [
  "post.html",
  "image-prompts.json",
  "metadata.json",
  "guide.md",
];

// fileList: array of file names present in the folder (top-level).
export function inferSteps(fileList) {
  const have = new Set(fileList || []);
  const checkpoints = STEP_FILES.map((s) => ({
    ...s,
    done: have.has(s.file),
  }));

  const doneNonOptional = checkpoints.filter((c) => c.done && !c.optional);
  const reachedStep = doneNonOptional.length
    ? Math.max(...doneNonOptional.map((c) => c.step))
    : 0;
  const reachedLabel =
    [...checkpoints].reverse().find((c) => c.done && !c.optional)?.label || null;

  // The first non-optional checkpoint that is still missing = where it stopped.
  const next = checkpoints.find((c) => !c.done && !c.optional) || null;

  const complete = REQUIRED_FOR_COMPLETE.every((f) => have.has(f));

  return {
    steps: checkpoints,
    reachedStep,
    reachedLabel,
    nextStep: next?.step ?? null,
    nextLabel: next?.label ?? null,
    complete,
  };
}

// Human-readable one-liner for an error, given how far it got.
export function describeStop(progress, error) {
  const where = progress?.reachedStep
    ? `STEP ${progress.reachedStep}(${progress.reachedLabel})까지 완료`
    : "리서치 시작 전";
  const stoppedAt = progress?.nextStep
    ? ` → STEP ${progress.nextStep}(${progress.nextLabel})에서 중단`
    : "";
  const cause = error ? ` · 원인: ${error}` : "";
  return `${where}${stoppedAt}${cause}`;
}
