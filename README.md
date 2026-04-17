# yt-guide

Tube Factory 스타일 갤러리의 웹 게시용 정적 사이트입니다.

## 구조

- `index.html` / `styles.css` / `app.js`: 웹 앱 본체
- `data/gallery.json`: 카드 메타데이터와 프롬프트
- `assets/images/`: 분리된 이미지 리소스
- `scripts/build-gallery.mjs`: 로컬 원본 HTML에서 웹용 리소스를 다시 생성하는 스크립트

## 로컬 갱신

원본 `tubefactory-styles.html`이 갱신되면 상위 디렉토리에서 아래 명령으로 웹용 리소스를 다시 생성합니다.

```bash
node yt-guide/scripts/build-gallery.mjs
```
