# Vercel → 윈도우 PC 셀프호스팅 마이그레이션

이 문서는 yt-guide를 Vercel에서 24/7 가동 중인 윈도우 PC로 옮기고 Cloudflare Tunnel로 외부 노출하는 절차를 정리합니다.

> **왜 옮기나**
> - `/tools/blog-builder`가 로컬 `claude` CLI를 spawn해야 동작 (Vercel 서버리스에선 불가)
> - `/api/gemini-generate`가 `claude` CLI 어댑터로 전환되어 OAuth 구독 쿼터를 사용 (Gemini API 비용 0)
> - 모듈 레벨 잡 스토어 (`lib/blog-job-store.js`)는 단일 프로세스 전제

## 사전 점검 — 끝남 ✅

- [x] Vercel 전용 패키지 없음 (`@vercel/*`, Edge Runtime 미사용)
- [x] `VERCEL_*` 환경변수 참조 없음
- [x] 모든 API 라우트가 `runtime = "nodejs"` 명시 또는 기본값 사용
- [x] `next start`로 빌드·실행 가능

---

## 0. 전제 조건 (윈도우 PC)

다음이 모두 설치되어 있어야 합니다:

| 도구 | 확인 명령 | 비고 |
|---|---|---|
| Node.js 20+ | `node -v` | 18 이하면 업그레이드 |
| Git | `git --version` | |
| Claude Code CLI | `claude --version` | 미설치 시 [docs.claude.com/claude-code](https://docs.claude.com/claude-code) |
| `claude` 인증 | `claude` 실행 후 정상 응답 | 미인증 시 `claude login` |
| cloudflared | `cloudflared --version` | 미설치 시 `winget install --id Cloudflare.cloudflared` |
| pnpm 또는 npm | `npm -v` | Node 함께 설치됨 |

**`claude login` 시 Pro/Max 플랜 계정으로 로그인** — 이 계정의 구독 쿼터가 yt-guide의 모든 LLM 호출에 자동 적용됩니다.

---

## 1. 레포 클론 + 빌드 검증

```powershell
# 작업 폴더 결정 (예시: C:\workspace)
cd C:\workspace
git clone https://github.com/<your-org>/yt-guide.git
cd yt-guide

# 블로그 빌더도 같은 부모 폴더에 클론 (이미 있다면 스킵)
cd ..
git clone https://github.com/<your-org>/claude-code-blog-builder.git
cd yt-guide

# 의존성 설치 + 빌드
npm install
npm run build
```

빌드가 성공하면 다음 단계.

---

## 2. 환경변수 설정 (`.env.local`)

레포 루트에 `.env.local` 파일 생성:

```ini
# Blog builder 통합용 — 절대경로
BLOG_BUILDER_PATH=C:\workspace\claude-code-blog-builder

# Claude CLI 설정 (Windows에서 PATH에 claude.cmd 가 있다면 비워둬도 자동 감지)
CLAUDE_BIN=
CLAUDE_PERMISSION_MODE=bypassPermissions

# Claude 모델 (선택). 비우면 CLI 기본값 사용.
CLAUDE_MODEL=

# /api/gemini-generate 타임아웃 (밀리초)
CLAUDE_GENERATE_TIMEOUT_MS=180000
```

> `claude.cmd`가 PATH에 없거나 spawn 실패 시 `CLAUDE_BIN`에 절대경로를 넣으세요. 보통 `C:\Users\<you>\AppData\Roaming\npm\claude.cmd` 또는 `claude` 설치 위치.

---

## 3. 수동 실행으로 동작 확인

```powershell
npm run start
# → http://localhost:3000
```

브라우저에서 다음을 확인:

- [ ] 홈 페이지 로딩
- [ ] 사이드바에 "블로그 제작 → 블로그 빌더" 메뉴 표시
- [ ] `/tools/blog-builder` 접속 → 키워드 입력 → 실행 (3~7분 대기) → 결과 카드 표시
- [ ] `/tools/subtitle-maker` (가사 만들기) → Claude CLI로 응답 받음
- [ ] `/tools/music-video-maker` → JSON 응답 정상 파싱
- [ ] `/prompts/ad-master` → multi-turn 대화 흐름

여기까지 통과하면 핵심 기능은 모두 정상.

---

## 4. PM2로 데몬화 (재부팅 자동 시작)

```powershell
# 글로벌 설치
npm install -g pm2 pm2-windows-startup

# 부팅 시 PM2 자동 실행 등록
pm2-startup install

# 서비스 등록 (절대경로 권장)
pm2 start npm --name yt-guide --cwd C:\workspace\yt-guide -- start

# 현재 상태를 부팅 스냅샷에 저장
pm2 save

# 상태 확인
pm2 status
pm2 logs yt-guide
```

업데이트 시:
```powershell
cd C:\workspace\yt-guide
git pull
npm install
npm run build
pm2 restart yt-guide
```

---

## 5. Cloudflare Tunnel 연결

### 5-1. 로그인 + 터널 생성

```powershell
cloudflared tunnel login
# 브라우저로 Cloudflare 대시보드 인증

cloudflared tunnel create yt-guide
# → 터널 ID 출력. 자격증명 파일 경로도 같이 표시됨
# 예: C:\Users\<you>\.cloudflared\<tunnel-id>.json
```

### 5-2. DNS 라우팅 (Cloudflare에 등록된 도메인 필요)

```powershell
cloudflared tunnel route dns yt-guide your-domain.com
# 또는 서브도메인
cloudflared tunnel route dns yt-guide guide.your-domain.com
```

### 5-3. 설정 파일 작성

`C:\Users\<you>\.cloudflared\config.yml`:

```yaml
tunnel: <tunnel-id>
credentials-file: C:\Users\<you>\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: guide.your-domain.com
    service: http://localhost:3000
  - service: http_status:404
```

### 5-4. 윈도우 서비스 등록

```powershell
# 관리자 권한 PowerShell에서
cloudflared service install
```

이후 부팅 시 자동 시작.

```powershell
# 상태 확인
cloudflared tunnel info yt-guide
```

브라우저에서 `https://guide.your-domain.com` 접속 → yt-guide 표시되면 성공.

---

## 6. 자동 배포 (선택)

### 옵션 A. 수동 (권장 — 안전)

코드 푸시 후 PC에 RDP/SSH 접속해서 직접 명령:

```powershell
cd C:\workspace\yt-guide
git pull && npm install && npm run build && pm2 restart yt-guide
```

`scripts/deploy.ps1`로 묶어두면 한 줄.

### 옵션 B. 자동 폴링 (5분마다 git pull)

`scripts/auto-deploy.ps1`:

```powershell
$repo = "C:\workspace\yt-guide"
Set-Location $repo
$before = git rev-parse HEAD
git fetch origin main --quiet
$after = git rev-parse origin/main
if ($before -ne $after) {
  Write-Host "Update detected, deploying..."
  git pull --quiet
  npm install --silent
  npm run build
  pm2 restart yt-guide
}
```

윈도우 작업 스케줄러로 5분마다 실행 등록:

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\workspace\yt-guide\scripts\auto-deploy.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName "yt-guide-auto-deploy" -Action $action -Trigger $trigger -RunLevel Highest
```

### 옵션 C. GitHub Actions → Webhook (최신성 즉각 반영)

푸시 즉시 배포되지만 PC에 webhook receiver 추가 필요 (예: Cloudflare Tunnel로 webhook 엔드포인트도 노출). 처음엔 옵션 A로 시작 권장.

---

## 7. Vercel 처리 — 단계적 절단

**즉시 끊지 말 것.** 다음 순서로:

1. **DNS만 끊기 (Vercel 배포는 살림)** — Cloudflare 도메인이 PC를 가리키도록만 변경. 문제 생기면 DNS 한 줄 되돌리면 즉시 Vercel 복귀.
2. **1주일 모니터링** — `pm2 logs yt-guide`, `cloudflared tunnel info` 매일 확인. 다운타임 없으면 다음 단계.
3. **Vercel 프로젝트 삭제** — Vercel 대시보드에서 프로젝트 삭제. GitHub repo 연결도 제거.
4. **`vercel.json` 등 Vercel 잔재 정리** (있다면).

---

## 8. 운영 체크리스트

### 일일
- `pm2 status` — yt-guide `online` 상태 확인
- `cloudflared tunnel info yt-guide` — 터널 connected 확인

### 주간
- `pm2 logs yt-guide --lines 200` — 에러 패턴 점검
- 디스크 공간 — `claude-code-blog-builder/output/` 누적되면 정리
- `claude --version` — CLI 업데이트 확인

### 장애 시 1차 진단

| 증상 | 확인 명령 | 의심 원인 |
|---|---|---|
| 사이트 안 열림 | `cloudflared tunnel info yt-guide` | 터널 끊김 → `cloudflared tunnel run yt-guide` 재실행 |
| `/api/gemini-generate` 500 | `pm2 logs yt-guide` | `claude` 인증 만료 → `claude login` 재실행 |
| `/api/blog/run` 500 | `pm2 logs yt-guide` | `BLOG_BUILDER_PATH` 잘못됨 또는 `claude` not on PATH |
| 빌드 실패 | `npm run build` | 의존성 변경 → `npm install` 재실행 |
| pm2 자체가 안 뜸 | `pm2 resurrect` | startup 등록 풀림 → `pm2-startup install` 재실행 |

---

## 9. 보안 주의

- **`.env.local`은 절대 git에 커밋 금지** — `.gitignore`에 `.env*` 등록 확인됨
- **Cloudflare Access로 페이지 보호 권장** — 외부 노출 도메인이라 누구나 접근 가능. Cloudflare Zero Trust → Access → Application 추가로 이메일/Google SSO 게이트 걸기
- **`/tools/blog-builder`는 로컬 `claude` 쿼터를 소비** — 인증 안 걸린 상태로 외부에 열면 모르는 사람이 본인 구독 쿼터 태움

---

## 10. 롤백 계획

문제 발생 시:

1. **빠른 롤백**: Cloudflare DNS를 Vercel로 되돌림 (Vercel 프로젝트가 살아있는 동안만 가능)
2. **앱 롤백**: `pm2 stop yt-guide && git checkout <prev-commit> && npm run build && pm2 restart yt-guide`
3. **블로그 빌더만 비활성화**: `.env.local`에서 `BLOG_BUILDER_PATH` 비우기 → `/tools/blog-builder`만 죽고 나머지는 정상

---

## 부록 — 명령 모음

```powershell
# 상태 한눈에
pm2 status
cloudflared tunnel list
claude --version

# 로그
pm2 logs yt-guide --lines 100
Get-Content C:\Users\<you>\.cloudflared\<tunnel-id>.log -Tail 50

# 재시작
pm2 restart yt-guide
Restart-Service cloudflared

# 완전 정지
pm2 stop yt-guide
Stop-Service cloudflared
```
