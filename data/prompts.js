import {
  novelWebArchitectureContent,
  novelThreeDepthPromptContent,
  novelFantasyLongformPromptContent,
} from "./novel-prompts.js";

export const promptLibrary = {
  title: '개인 프롬프트 저장소',
  categories: [
    {
      id: 'script',
      name: '대본 제작',
      prompts: [
        {
          id: 'script-master',
          title: '01. 대본 만들기 프롬프트',
          summary: '노트북LM 자료수집 후, 장문 유튜브 대본용 클로드 프롬프트를 생성하는 템플릿',
          tags: ['NotebookLM', 'Claude', '유튜브 대본'],
          content: `방법 : 노트북LM (https://notebooklm.google.com/)
주제에 대해서 먼저 '자료수집'검색 한 다음, 참조할 자료를 선택한 뒤 아래 프롬프트를 입력

-------------------------------------------------------------------------------------

[(영상주제)]을 유튜브 영상으로 만들거야.
댄 하먼의 8단계 법칙을 이용해서 대본을 만들 수 있는 클로드 프롬프트 만들어줘,
대신에, 효과음 다른 부수적인건 빼고, 바로 복붙해서 편집할 수 있게 해줘
(2만자 이상으로 30분 분량)으로 쓰게 해주고, 정보는 니가 방금 수집한 정보내에서 대본을 적을 수 있도록 해줘.
설명만 하지 말고 등장인물들의 대사도 드라마틱하게 몇 장면 구성해줘.
한자 넣지 말고, 읽기 편하게 두 문장씩 한줄 띄기로 구분해주고,
클로드가 정보를 창작하지 못하게 (AI거짓말) 해줘
클로드는 실제로 니가 갖고 온 자료를 못보잖아. 그 자료를 인용해서 할 수있게 해주고
도입부 끝나고는 구독과 좋아요 멘트 자연스럽게 반드시 넣어줘
너는 (역사적 사실을 객관적이고 깊이 있게 전달하는 다큐멘터리 해설가)라고 설정해줘

-------------------------------------------------------------------------------------

sample #1
[ 계유정난 직전 – “수양대군의 쿠데타 준비 72시간” ]을 유튜브 영상으로 만들거야.
댄 하먼의 8단계 법칙을 이용해서 대본을 만들 수 있는 클로드 프롬프트 만들어줘,
대신에, 효과음 다른 부수적인건 빼고, 바로 복붙해서 편집할 수 있게 해줘
2만자 이상으로 30분 분량으로 쓰게 해주고, 정보는 니가 방금 수집한 정보내에서 대본을 적을 수 있도록 해줘.
설명만 하지 말고 등장인물들의 대사도 드라마틱하게 몇 장면 구성해줘.
한자 넣지 말고, 읽기 편하게 두 문장씩 한줄 띄기로 구분해주고,
클로드가 정보를 창작하지 못하게 (AI거짓말) 해줘
클로드는 실제로 니가 갖고 온 자료를 못보잖아. 그 자료를 인용해서 할 수있게 해주고
도입부 끝나고는 구독과 좋아요 멘트 자연스럽게 반드시 넣어줘
너는 역사적 사실을 객관적이고 깊이 있게 전달하는 다큐멘터리 해설가라고 설정해줘

sample #2
[기초연금]을 유튜브 영상으로 만들거야.
댄 하먼의 8단계 법칙을 이용해서 대본을 만들 수 있는 클로드 프롬프트 만들어줘,
대신에, 효과음 다른 부수적인건 빼고, 바로 복붙해서 편집할 수 있게 해줘
1만자 이상으로 쓰게 해주고, 정보는 니가 방금 수집한 정보내에서 대본을 적을 수 있도록 해줘.
클로드가 정보를 창작하지 못하게 (AI거짓말) 해줘
클로드는 실제로 니가 갖고 온 자료를 못보잖아. 그 자료를 인용해서 할 수있게 해주고
도입부 끝나고는 구독과 좋아요 멘트 자연스럽게 넣어줘
너는 사실을 객관적이고 깊이 있게 전달하는 정보전달 해설가라고 설정해줘`,
        },
      ],
    },
    {
      id: 'novel',
      name: '소설 제작',
      prompts: [
        {
          id: 'novel-web-architecture',
          title: '웹소설 아키텍처',
          summary: '웹소설 아키텍트 페르소나, 창작 독트린, 문체 가이드, 명령어 메뉴(기획·집필·퇴고)',
          tags: ['웹소설', '연재', '문피아'],
          content: novelWebArchitectureContent,
        },
        {
          id: 'novel-3depth-prompt',
          title: '소설용 3뎁스 프롬프트',
          summary: '장편 플로터 설계, 챕터 집필, 설정 점검, 장편 판타지 설계·집필까지 한 파일에 묶은 템플릿',
          tags: ['장편소설', '플롯', '판타지'],
          content: novelThreeDepthPromptContent,
        },
        {
          id: 'novel-fantasy-longform',
          title: '장편 판타지 프롬프트',
          summary: '상업 장편 판타지 1권 분량 설계·집필: 세계관, 힘의 시스템, 갈등, 챕터 구성, 본문 규칙',
          tags: ['판타지', '세계관', '장편'],
          content: novelFantasyLongformPromptContent,
        },
      ],
    },
    {
      id: 'character-scene',
      name: '캐릭터/장면',
      prompts: [
        {
          id: 'character-style',
          title: '02. 분위기+인물(캐릭터) 만들기 프롬프트',
          summary: '대본을 바탕으로 스타일 선택 후 등장인물 목록과 영어 프롬프트를 만드는 단계형 템플릿',
          tags: ['캐릭터', '스타일', '이미지 프롬프트'],
          content: `아래 대본을 읽고 다음 순서대로 진행해주세요.
━━━━━━━━━━━━━━━━━━━━
[STEP 1] 스타일 선택
━━━━━━━━━━━━━━━━━━━━
먼저 아래 6가지 이미지 스타일 중 어떤 스타일을 원하는지 물어보세요.
선택을 받기 전까지 인물 추출과 프롬프트 생성은 하지 마세요.
① 아름다운 웹툰 스타일
② 수채화 일러스트 스타일
③ 동양화 풍 스타일
④ 사실적 디지털 아트 스타일
⑤ 고품질 애니메이션 스타일
⑥ 유화 클래식 스타일
⑦ 스타일 직접입력

━━━━━━━━━━━━━━━━━━━━
[STEP 2] 번호를 받으면 아래를 한 번에 출력
━━━━━━━━━━━━━━━━━━━━
스타일별 영어 키워드:
① 웹툰: beautiful Korean webtoon manhwa style, detailed expressive line art, vibrant colors, soft cel shading, emotional character expressions
② 수채화: soft watercolor illustration style, delicate brushstrokes, warm muted tones, dreamy atmospheric washes, painterly texture
③ 동양화: traditional Korean East Asian ink painting style, elegant calligraphic brush strokes, negative space beauty, ink wash with subtle color accents
④ 디지털 아트: hyperrealistic digital concept art, cinematic dramatic lighting, detailed textures, movie poster quality, photorealistic rendering
⑤ 애니메이션: premium anime illustration style, detailed character design, large expressive eyes, clean sharp linework, vibrant cel shading
⑥ 유화: classical oil painting style, rich jewel-toned colors, dramatic chiaroscuro lighting, Renaissance composition, thick impasto texture
⑦

# 출력 형식:
시대 배경: ○○

# 인물 목록:
1. 이름(한글) / 영문 표기 / 성별 / 나이대 / 역할 / 외모·복장 특징
(주요 인물 5~8명. 시대적 배경과 성별 정확히 반영)

─── 영어 프롬프트 ───
[Character 1 Name in English]
(외모/의상/표정/시대 특징 + 선택 스타일 키워드. 콤마 구분. 충분히 상세하게)

[Character 2 Name in English]
(외모/의상/표정/시대 특징 + 선택 스타일 키워드. 콤마 구분. 충분히 상세하게)

(인물 사이 빈 줄 하나. 모든 인물 영어 완료 후)

─── 한글 설명 ───
[인물 1 한글명]
(2~3문장. 위 영어 프롬프트 핵심 내용을 자연스러운 한국어로)

[인물 2 한글명]
(2~3문장. 위 영어 프롬프트 핵심 내용을 자연스러운 한국어로)

(인물 사이 빈 줄 하나)

# 대본:
(여기에 대본 전체 붙여넣기)`,
        },
        {
          id: 'intro-scene',
          title: '03. 도입부 장면 만들기 프롬프트',
          summary: '도입부 텍스트를 문장 단위로 쪼개 이미지/영상 프롬프트를 1:1로 만드는 템플릿',
          tags: ['도입부', '장면 생성', '영상 프롬프트'],
          content: `도입부 장면 프롬프트를 만들어주세요.

【절대 규칙】
① 마침표(.)와 쉼표(,)로 끊어지는 모든 문장·절마다 프롬프트 하나씩.
② 쉼표로 이어지는 짧은 절도 독립 프롬프트로 처리.
③ 단 하나도 빠짐없이.
④ 등장 인물은 반드시 1단계에서 설정한 인물과 일치.

출력 형식:
【도입부】
─── 이미지 프롬프트 (영어) ───
(외모/의상/배경/분위기 + 스타일 키워드. 충분히 상세하게)
(외모/의상/배경/분위기 + 스타일 키워드. 충분히 상세하게)
(프롬프트마다 빈 줄 하나)

─── 이미지 프롬프트 (한글 설명) ───
(한글 설명 1~2문장)
(한글 설명 1~2문장)
(프롬프트마다 빈 줄 하나)

─── 영상 프롬프트 (한국어) ───
(이미지 프롬프트와 1:1 대응. 카메라 앵글+움직임+조명+분위기+효과. 2~3문장)
(이미지 프롬프트와 1:1 대응. 카메라 앵글+움직임+조명+분위기+효과. 2~3문장)
(프롬프트마다 빈 줄 하나)

영상 프롬프트 규칙:
- 이미지 프롬프트 수와 반드시 1:1 대응. 하나도 빠짐없이.
- 한국어로만 작성 (영어 금지).
- 시네마틱 용어 적극 활용: 줌인/아웃, 슬로우 패닝, 틸트업/다운, 클로즈업, 익스트림 클로즈업, 오버숄더샷, 버드아이뷰, 로우앵글, 페이드인/아웃, 슬로우모션, 핸드헬드, 트래킹샷

도입부 내용:
(여기에 도입부 텍스트만 붙여넣기)`,
        },
        {
          id: 'section-scene',
          title: '04. 나머지 섹션들 장면 만들기 프롬프트',
          summary: '섹션별 텍스트를 이미지 프롬프트로 변환하는 본문 장면 생성 템플릿',
          tags: ['섹션', '장면 생성', '이미지 프롬프트'],
          content: `[섹션명] 장면 이미지 프롬프트를 만들어주세요.

【절대 규칙】
① 마침표(.)와 쉼표(,)로 끊어지는 모든 문장·절마다 프롬프트 하나씩.
② 쉼표로 이어지는 짧은 절도 독립 프롬프트로 처리.
③ 단 하나도 빠짐없이.
④ 등장 인물은 반드시 1단계에서 설정한 인물과 일치.

출력 형식:
【섹션명】
─── 이미지 프롬프트 (영어) ───
(외모/의상/배경/분위기 + 스타일 키워드. 충분히 상세하게)
(외모/의상/배경/분위기 + 스타일 키워드. 충분히 상세하게)
(프롬프트마다 빈 줄 하나)

─── 이미지 프롬프트 (한글 설명) ───
(한글 설명 1~2문장)
(한글 설명 1~2문장)
(프롬프트마다 빈 줄 하나)

내용:
(여기에 해당 섹션 텍스트만 붙여넣기)`,
        },
        {
          id: 'character-sheet',
          title: '캐릭터 시트 생성 마스터 프롬프트',
          summary: '캐릭터 특징과 아트 스타일을 받아 4분할 캐릭터 시트를 생성하는 구조화 프롬프트',
          tags: ['캐릭터 시트', '디자인 시트', '마스터 프롬프트'],
          content: `다음 절차를 반드시 순서대로 따르시오:

--------------------------------------------------

STEP 1
사용자에게 다음과 같이 질문하시오:
"캐릭터의 특징을 나열하여 주세요."
사용자의 답변이 오기 전에는 절대 다음 단계로 진행하지 마시오.

--------------------------------------------------

STEP 2
사용자에게 다음과 같이 질문하시오:
"이미지의 Art Style을 입력해주세요."
사용자의 답변이 오기 전에는 절대 다음 단계로 진행하지 마시오.

--------------------------------------------------

STEP 4
사용자의 입력을 기반으로 “고정 요소”와 “변형 가능 요소”를 분리하시오.

[고정 요소]
- 사용자가 명시적으로 입력한 모든 특징
- 성별, 나이, 인종, 핵심 외형 등

[변형 가능 요소]
- 사용자가 입력하지 않은 모든 세부 요소
- 색상, 재질, 디테일 구조, 악세사리, 세부 치수 등

--------------------------------------------------

[입력 해석 및 우선순위 규칙]

사용자의 입력은 아래 두 가지 유형으로 분류하시오:

1) 명확한 묘사 (Explicit Traits)
- 외형, 수치, 색상, 구조 등 직접적으로 정의된 정보
- 예: "검은 머리", "단발", "키 170cm", "마른 체형"

2) 암시적 표현 (Implicit Traits)
- 분위기, 성격, 인상, 감정 등 간접적인 정보
- 예: "차가운 느낌", "도도한 성격", "몽환적인 분위기"

--------------------------------------------------

[반영 규칙]

1. 명확한 묘사는 해당 항목에 그대로 반영할 것 (수정 금지)

2. 암시적 표현은 직접적으로 항목에 쓰지 말고,
그 의미를 해석하여 비어 있는 세부 항목들에 구체적인 형태로 변환하여 반영할 것

--------------------------------------------------

[충돌 해결 규칙]

- 명확한 묘사 > 암시적 표현

- 두 요소가 충돌할 경우:
→ 명확한 묘사를 절대 우선으로 유지할 것
→ 암시적 표현은 해당 범위 내에서만 제한적으로 반영할 것

--------------------------------------------------

[출력 금지 규칙]

- 분위기, 성격 등의 추상적 표현을 그대로 출력하지 말 것
- 반드시 물리적/시각적 요소로 변환하여 작성할 것

--------------------------------------------------

STEP 5
고정 요소와 변형 가능 요소를 기반으로, 하나의 캐릭터 시트를 생성하시오.

규칙:

[공통 규칙]
- 고정 요소는 반드시 유지할 것
- 전체 레이아웃 구조는 템플릿을 그대로 따를 것

[생성 규칙]
- 변형 가능 요소를 활용하여 누락된 모든 디테일을 보완할 것
- 모든 요소는 구체적이고 명확하게 정의할 것
- 모호하거나 추상적인 표현은 사용하지 말 것

--------------------------------------------------

STEP 6
각 시트에 대해, 누락된 모든 정보를 보완하여 완전한 스펙을 생성하시오.

모든 요소는 반드시 아래 기준으로 정의할 것:

- Position (위치)
- Size (치수)
- Shape (형태)
- Material (재질)
- State (상태)

모호한 표현 금지.

--------------------------------------------------

[포즈 제약 규칙]

- 캐릭터는 반드시 반듯하게 선 정자세를 유지할 것
- 과장된 동작이나 역동적인 포즈는 금지
- 팔과 다리는 신체 구조에 맞게 자연스럽게 정렬될 것
- 소지품이 있을 경우, 물리적으로 자연스럽고 어색하지 않은 방식으로 들고 있을 것

--------------------------------------------------

STEP 7
각 시트는 아래 템플릿을 절대 수정하지 말고 그대로 사용하여 생성하시오.

- 구조 변경 금지
- 항목 삭제 금지
- 순서 변경 금지
- 모든 항목은 최대한 상세하게 작성

--------------------------------------------------

STEP 8 (출력 규칙)

- 각 시트는 반드시 하나의 코드블록으로 출력할 것
- 코드블록 외에는 어떤 텍스트도 출력하지 말 것

--------------------------------------------------

<CHARACTER SHEET TEMPLATE>

**[OVERALL COMPOSITION - FIXED LAYOUT]**
A professional character design sheet featuring a single [Gender] character, [Art Style], high-quality, 4k resolution, neutral grey studio background (#808080).

The canvas is divided into FOUR vertical sections (1x4 layout), arranged from left to right:

--------------------------------------------------

[SECTION 1 - RIGHT 45° FULL BODY]
- Full body view from a 45-degree angle facing right
- Character stands upright in a neutral, straight posture
- Arms relaxed naturally at the sides unless holding a prop
- If holding a prop, the pose must naturally incorporate the item

--------------------------------------------------

[SECTION 2 - LEFT 45° FULL BODY]
- Full body view from a 45-degree angle facing left
- Same posture and proportional consistency as Section 1
- No pose variation except mirrored orientation

--------------------------------------------------

[SECTION 3 - BACK FULL BODY]
- Full body view from directly behind
- Upright neutral standing posture
- Clear visibility of back structure (hair, outfit, silhouette)

--------------------------------------------------

[SECTION 4 - FACE DETAIL STACK (VERTICAL 3-SPLIT)]

Top:
- Face view from a 45-degree angle facing right

Middle:
- Face view from a 45-degree angle facing left

Bottom:
- Face view from directly behind

Rules:
- Equal vertical spacing
- Zoomed-in framing focused on head only
- Consistent scale and alignment

--------------------------------------------------

[GLOBAL LAYOUT RULES]

- All sections must maintain consistent character proportions
- No perspective distortion between sections
- Strict alignment and equal spacing across all divisions
- No rearrangement of section order
- Clean separation between sections

--------------------------------------------------

**[CHARACTER SPECIFICATION - FULL DEFINITION]**

[Identity]
- Gender:
- Age:
- Ethnicity:

[Body]
- Height:
- Proportion:
- Build:
- Shoulder width:
- Waist:
- Hip:
- Posture:

[Pose]
- A-pose
- Arms:
- Elbows:
- Hands:
- Legs:
- Weight distribution:

--------------------------------------------------

[Face]
- Shape:
- Jaw:
- Chin:
- Eyes:
- Eye color:
- Eye size:
- Brows:
- Nose:
- Lips:
- Skin:
- Expression:

[Makeup]
- Base:
- Blush:
- Eyeshadow:
- Eyeliner:
- Mascara:
- Lips:

--------------------------------------------------

[Hair]
- Length:
- Part:
- Structure:
- Strand thickness:
- Layering:
- Volume:
- Flow:
- Color:
- Surface:
- State:

--------------------------------------------------

[Outfit]

Top:
- Type:
- Length:
- Fit:
- Neckline:
- Sleeve:
- Fabric:
- Wrinkles:

Skirt:
- Type:
- Waist position:
- Length:
- Shape:
- Structure:
- Pleats:
- Fabric:
- Movement:

--------------------------------------------------

[Footwear]
- Type:
- Heel height:
- Sole thickness:
- Shape:
- Coverage:
- Material:
- Color:
- Fit:
- State:

--------------------------------------------------

[Accessories / Wear Position]

Earrings:
- Type:
- Length:
- Material:
- Position:
- Movement:

Necklace:
- Type:
- Lengths:
- Position:
- Material:

Rings:
- Count:
- Placement:
- Material:

Bracelet:
- Wrist:
- Fit:
- Material:

--------------------------------------------------

[Props]
-

--------------------------------------------------

**[TECHNICAL SPECIFICATIONS]**

[Lighting]
- Key:
- Fill:
- Rim:
- Shadow:

[Rendering Style]
-

[Color Control]
-

[Consistency Rules]
-

[Final Constraint]
-`,
        },
      ],
    },
    {
      id: 'ad',
      name: '광고 제작',
      prompts: [
        {
          id: 'ad-master',
          title: '광고 마스터 프롬프트',
          summary: '광고 제품 입력부터 스토리보드, 피사체 프롬프트, 최종 15초 광고 프롬프트까지 만드는 마스터 템플릿',
          tags: ['광고', '스토리보드', '영상 프롬프트'],
          content: `# 광고 영상 프롬프트 생성 마스터 프롬프트

이 프롬프트를 받으면, 반드시 아래 순서를 따를 것.

1. 사용자에게 먼저 질문한다. (일반 텍스트로 출력, 코드블록 사용 금지)
"광고할 제품, 타켓층, 광고 플랫폼, 원하는 광고 스타일 등을 입력하고, 추가 요구사항도 써주세요."
2. 사용자의 입력을 받은 후에만 작업을 시작한다. 입력 없이 임의로 내용을 생성하지 않는다.

────────────────────────────────
[공통 규칙]
────────────────────────────────

1. 모든 피사체는 반드시 [] 형식의 고유 이름으로 정의한다.
2. 모든 Shot 및 본문에서는 반드시 동일한 [] 이름으로 피사체를 지칭한다.
3. 하나의 결과물 내에서 다른 표기 방식(@image 등)은 절대 사용하지 않는다.
4. 사람 피사체의 경우:
- 반드시 임의의 이름을 부여한다. (fullname 금지)
- 이름은 설정된 인종/국적에 맞는 실제 사용되는 이름 체계를 따른다.
- 표기는 반드시 한글로 하고, 자연스럽고 현실적인 이름을 사용한다.
- 이름은 중복 없이 고유하게 설정한다.
- 피사체는 설정 즉시 가장 먼저 이름을 확정한 후, 이후 모든 단계에서 해당 이름만 사용한다.
- 역할, 직업, 설명형 명칭(예: 여자, 남자, 가수 등)은 피사체 이름으로 절대 사용할 수 없다.
5. 사람 이외의 피사체의 경우:
- 직관적이고 식별 가능한 명칭을 사용한다.
- 띄어쓰기를 사용하지 않는다.
- 복합 명칭은 단어를 붙여 하나의 고유 식별자로 만든다.
6. 피사체 번호 부여 규칙:
- 광고 대상 제품/사물은 반드시 @image1을 부여한다. (번호 1번은 항상 광고 대상에 고정)
- 이후 등장하는 피사체에는 등장 순서대로 @image2, @image3... 순으로 번호를 부여한다.
- 부여된 번호는 전체 결과물에서 일관되게 유지한다.
7. 최종 영상 프롬프트는 4000자를 넘지 않아야 한다.

────────────────────────────────
[피사체 프로파일 작성 규칙]
────────────────────────────────

1. 각 피사체는 아래 형식으로만 나열한다:
[피사체 이름] : refer to the @image(번호) strictly
2. 광고 대상은 반드시 포함하며 @image1을 부여한다.
3. 피사체별 추가 서술 없이, 위 형식 한 줄로만 표기한다.

────────────────────────────────
[광고 트렌드 및 레퍼런스 분석 규칙]
────────────────────────────────

스토리보드 작성 전, 반드시 아래 항목을 내부적으로 분석하고 그 결과를 스토리보드와 프롬프트 전반에 반영한다. 이 분석 과정은 출력하지 않는다.

1. 광고 대상 카테고리를 파악한다. (예: 뷰티, 테크, 식음료, 패션, 자동차 등)
2. 해당 카테고리에서 현재 가장 주목받는 광고 연출 트렌드를 파악한다.
- 글로벌 수상작(칸 라이언즈, 클리오 어워즈 등) 및 바이럴 광고의 연출 방식
- 타겟 플랫폼(인스타그램, 유튜브, 틱톡 등)에 최적화된 포맷과 훅 구조
- 경쟁 브랜드 광고와 차별화되는 비주얼 전략
3. 분석 결과를 바탕으로, 해당 광고에 가장 임팩트 있는 오프닝 훅, 감정 곡선, 클로징 방식을 결정한다.
4. 배경 연출, 시각 이펙트, 색감, 텍스트 등장 방식도 트렌드 분석을 기반으로 설정한다.

────────────────────────────────
[스토리보드 작성 규칙]
────────────────────────────────

1. 전체 영상 길이는 15초로 고정한다.
2. 스토리보드는 [광고 트렌드 및 레퍼런스 분석 규칙]의 분석 결과와 사용자의 요구사항(제품, 타겟층, 플랫폼, 스타일, 추가 요구사항)을 종합적으로 고려하여, 해당 광고에 가장 효과적인 구성으로 작성한다.
3. 최종 결과는 아래 [출력 구조]에 따라 순서대로 출력한다.
4. 모든 Shot의 길이 누적 합이 정확히 15초가 되도록 Shot을 설계한다.
5. shot의 최소 길이는 1.5초 이상이어야 한다.

────────────────────────────────
[텍스트 출력 금지 규칙]
────────────────────────────────

1. 영상 전체에 걸쳐 어떠한 텍스트도 화면에 등장시켜서는 안 된다.
- 슬로건, 브랜드명, 자막, 카피, 태그라인 등 모든 형태의 텍스트 오버레이를 금지한다.
2. 이 규칙은 모든 Shot에 예외 없이 적용된다.
3. 프롬프트 내 Shot 내용에 텍스트 등장 연출을 절대 포함하지 않는다.

────────────────────────────────
[출력 구조]
────────────────────────────────

출력은 아래 4단계 순서로 구성한다. 코드블록 없이 일반 텍스트로 출력하는 항목과 코드블록으로 출력하는 항목을 구분하여 따른다.

① [스토리보드] — 일반 텍스트, 표 형식으로 출력

| Shot | 시간 | 구도 | 무브 | 렌즈 | 내용 |
형식으로 전체 Shot을 나열한다.
- 시간 열에는 각 Shot의 시작/끝 시간을 표기한다. 형식: 0:00-0:05s
- 내용 열에는 장면을 한 줄로 간략히 요약한다.

(한 줄 공백)

② [피사체 생성 프롬프트] — 피사체 이름은 코드블록 바깥에 일반 텍스트로 출력하고, 프롬프트 내용만 개별 코드블록으로 출력한다.

- 반복 등장하는 피사체만 포함한다. (사람, 동물, 물건 등)
- 단발성 대상은 제외한다.
- 각 피사체를 이미지 생성 AI로 생성할 때 사용할 프롬프트를 코드블록으로 출력한다.
- 프롬프트는 해당 피사체를 정확하게 재현할 수 있도록 구체적으로 작성한다.
- 피사체 종류별 레이아웃 규칙:
- 사람: 가로로 2개 영역으로 나눠서, 왼쪽에는 전신 모습, 오른쪽에는 얼굴을 크게 확대한 모습이 배치되도록 구성한다. 프롬프트 마지막에 반드시 "front-view, neutral expression, studio lighting, clean white background"를 붙인다.
- 동물: 가로로 2개 영역으로 나눠서, 왼쪽에는 정면 모습, 오른쪽에는 측면 모습이 배치되도록 구성한다.
- 물건/제품: 가로로 2개 영역으로 나눠서, 왼쪽에는 전면 모습, 오른쪽에는 후면 모습이 배치되도록 구성한다.

- 사람 피사체의 외관 세팅 규칙:
- 단순한 기본 복장이나 설명형 묘사를 절대 사용하지 않는다.
- 광고 제품의 카테고리, 브랜드 분위기, 영상 스타일, 장면 내용을 종합적으로 분석하여 해당 광고에 최적화된 완성도 높은 광고 모델 룩을 설계한다.
- 아래 항목을 반드시 모두 포함하며, 각 항목은 광고 맥락에 맞게 스타일리쉬하고 구체적으로 서술한다:
  - 의상: 브랜드·소재·색상·실루엣·디테일까지 명시한다.
  - 헤어: 스타일링 방식(블로우아웃, 웨이브, 업스타일 등), 윤기, 컬러, 볼륨감, 마감 방향까지 구체적으로 서술한다.
  - 메이크업: 피부 표현 방식(글래스 스킨, 매트 등), 아이 메이크업, 립 컬러·질감, 하이라이터, 컨투어링까지 광고 카메라에 최적화된 에디토리얼 메이크업으로 설정한다.
  - 액세서리: 주얼리, 신발, 백 등 광고 분위기에 어울리는 아이템을 브랜드·소재·디테일 수준으로 명시한다.
  - 체형 표현: 광고 목적에 맞는 신체 부위 강조 포인트를 포함한다.

출력 형식:
[피사체명]
(프롬프트를 코드블록으로 출력)

(한 줄 공백)

③ 출력 후 사용자 승인 요청 — 일반 텍스트로 출력

[스토리보드]와 [피사체 생성 프롬프트] 출력이 끝나면 반드시 아래 문장을 출력하고 사용자의 응답을 기다린다:
"수정할 내용이 있나요? 없으면 승인을 해주세요."
- 승인을 받은 후에만 프롬프트 작성을 시작한다.
- 수정 요청이 있을 경우 해당 내용을 반영한 후 다시 승인을 요청한다.

(한 줄 공백)

④ 프롬프트 — 하나의 코드블록으로 출력

코드블록은 아래 구조를 반드시 포함한다:

[Style]
- 사용자의 입력과 광고 대상, 타겟층, 플랫폼, 트렌드 분석 결과를 종합적으로 고려하여 임의로 판단한다.
- 시청자가 광고를 보고 시각적 hook를 받을 수 있도록, 색감·조명·질감·분위기·편집 톤을 구체적으로 설정한다.
- 단순 스타일 명칭 나열이 아니라, 영상의 전체 비주얼 방향성이 느껴지는 묘사로 서술한다.
- color grading 방향(색온도, 채도, 콘트라스트, 필름 그레인 유무 등)을 반드시 명시한다.

(한 줄 공백)

[배경]
- 환경을 매우 구체적으로 서술한다.
- 시간대, 빛의 방향과 색온도, 공간 구조, 표면 질감을 포함한다.
- 배경에서 발생하는 시각적 이펙트를 상세히 묘사한다:
  (예: 빛 번짐(lens flare), 빛 산란(light scatter), 보케(bokeh), 표면 반사(surface reflection), 입자감(particle/dust), 안개(haze/fog), 공기 굴절(heat distortion) 등)
- 배경의 움직임 요소도 서술한다:
  (예: 흔들리는 잎사귀, 흐르는 연기, 움직이는 군중 실루엣, 떨어지는 빛 조각 등)
- 공기감, 습도, 계절감, 온도감이 시각적으로 느껴지도록 묘사한다.

(한 줄 공백)

[피사체 프로파일]
- 반복 등장하는 피사체만 포함한다.
- 단발성 대상은 제외한다.
- 각 피사체는 아래 형식으로만 나열한다:
[피사체 이름] : refer to the @image(번호) strictly

(한 줄 공백)

[Shot]

형식:
[0:00-0:05s] Shot 1 : 카메라 구도, 카메라 무브, 렌즈

- 카메라 구도와 무브는 반드시 영어로 작성한다.
- Shot 사이에는 한 줄 공백을 둔다.
- Shot 번호는 1부터 순서대로 부여한다.
- Shot 시간은 0:00부터 시작하여 15초까지 이어진다.
- 각 Shot 내용의 마지막에는 반드시 "hard cut."을 붙인다.

────────────────────────────────
[Shot 내용 규칙]
────────────────────────────────

1. 각 Shot 아래에는 장면을 자연스럽게 서술한다.

2. 대사는 아래 형식으로 포함한다:
[피사체명]이 "대사 내용"이라고 한국어로 말한다.
대사는 반드시 한국어로 작성한다.

3. 특수 효과음이 필요한 경우:
- 발생 타이밍
- 소리 종류
를 반드시 명시한다.

4. 시각 이펙트 묘사 규칙:
각 Shot에서 발생하는 시각 이펙트는 반드시 아래 항목을 포함하여 구체적으로 묘사한다.
- 이펙트 종류: (예: 슬로모션, 스피드 램프, 모션블러, 렌즈 플레어, 라이트 리크, 글리치, 크로마틱 어버레이션, 파티클 산란, 렌즈 디스토션, 화이트 플래시, 페이드 인/아웃, 비네트, 필름 번인 등)
- 이펙트 발생 타이밍과 지속 시간
- 이펙트의 강도와 방향성 (예: 중심에서 외곽으로 번짐, 좌→우 방향의 라이트 리크 등)
- 이펙트가 피사체 또는 배경에 미치는 시각적 영향
- 이펙트가 없는 Shot의 경우에도 "이펙트 없음"이라고 명시하는 것을 금지하며, 대신 해당 Shot의 조명·심도·질감 표현을 서술한다.

5. 텍스트 등장 금지 규칙:
모든 Shot에서 텍스트(슬로건, 브랜드명, 자막, 카피, 태그라인 등 모든 형태의 텍스트 오버레이)는 절대 등장시키지 않는다. 이 규칙은 예외 없이 전체 영상에 적용된다.

6. 각 Shot 내용 서술의 마지막 문장은 반드시 "hard cut."으로 끝낸다.

────────────────────────────────
[카메라 연출 강화 규칙]
────────────────────────────────

1. 각 Shot에는 반드시 아래 3가지를 모두 포함한다:
- 카메라 구도 (shot type)
- 카메라 무브 (camera movement)
- 카메라 렌즈 (focal length 또는 렌즈 종류)

2. 형식:
[0:00-0:05s] Shot 1 : [구도], [카메라 무브], [렌즈]

예시:
[0:00-0:05s] Shot 1 : medium shot, dolly in, 50mm lens`,
        },
      ],
    },
    {
      id: 'audio',
      name: '음악 제작',
      prompts: [
        {
          id: 'suno-master',
          title: '수노프롬프트 생성용 프롬프트',
          summary: 'Suno용 5단계 구조 프롬프트를 만들기 위한 역할 정의와 출력 형식',
          tags: ['Suno', '음악', '5단계 프롬프트'],
          content: `### ROLE & IDENTITY (역할 및 정체성)
당신은 **[Suno Prompt Architect]**입니다. 당신은 AI 음악 생성 모델인 'Suno'의 알고리즘을 완벽하게 이해하고 있으며, 추상적인 음악적 아이디어나 레퍼런스를 Suno가 가장 잘 이해할 수 있는 **'구조화된 5단계 프롬프트'**로 변환하는 세계 최고의 전문가입니다.
당신의 임무는 사용자가 제공하는 입력(URL, 뉘앙스 설명, 가사 등)을 분석하여, 단순한 키워드 나열이 아닌 **'음악적 서사(Musical Narrative)'가 담긴 고품질 프롬프트**를 생성하는 것입니다.

다음 절차를 반드시 순서대로 따르시오:
--------------------------------------------------
STEP 1
사용자에게 다음과 같이 질문하시오:
"만들고 싶은 음악의 장르와 분위기, 장르, 가수 보컬 등을 설정해 주세요.
 ex) 비 오는 날 창밖을 보며 마시는 커피 같은 느낌. 차분하고 좀 우울한데 세련된 재즈 힙합으로 만들어줘. 여자 보컬."

사용자의 답변이 오기 전에는 절대 다음 단계로 진행하지 마시오.
--------------------------------------------------

### KNOWLEDGE BASE: THE 5-STEP FORMULA (핵심 지식)
당신은 다음의 5단계 공식을 철저히 준수하여 프롬프트를 작성해야 합니다.

1. *Identity (정체성):*
* Format: \`A [Gender/Type] vocalist sings over a [Genre/Style] piece.\`
* Goal: 곡의 전체적인 장르와 보컬의 성별을 한 문장으로 정의.
2. *Mood (분위기):*
* Format: \`It features a [Tempo] and a [Mood/Emotion], set in a [Major/Minor] key.\`
* Goal: 템포, 감정선, 조성(Key)을 명시하여 곡의 방향성 설정.
3. *Instruments (악기 구성):*
* Format: \`The [Main Instrument] plays a [Playing Style/Role], while the [Sub Instrument] provides a [Role].\`
* Goal: 단순히 악기명만 나열하지 말고, **'어떻게 연주하는지(Verb)'**를 묘사. (예: "Bass plays a walking line", "Guitar offers clean arpeggios")
4. *Performance (보컬/연주 퍼포먼스):*
* Format: \`The vocals are delivered in a [Texture/Range/Style] with [Technique].\`
* Goal: 보컬의 질감(Breath, Husky), 창법(Rapping, Belting), 음역대를 구체적으로 묘사.
5. *Production (프로덕션/사운드):*
* Format: \`The production is [Mix Style], featuring [Spatial Effects] and a [Structure].\`
* Goal: 믹싱 상태(Clean, Lo-fi), 공간감(Reverb, Dry), 사운드 질감을 정의.

### OPERATIONAL PROCESS (작동 절차)
사용자가 입력을 제공하면 다음 단계로 처리하십시오.

1. *Analyze (분석):*
* *URL/Audio:* (가능한 경우) 해당 곡의 장르, 악기, 분위기를 분석.
* *Text/Nuance:* 사용자의 묘사에서 핵심 감정과 스타일을 추출.
* *Lyrics:* 가사의 내용과 운율에 어울리는 장르와 템포를 추론.
2. *Construct (구성):* 위 5단계 공식에 맞춰 각 섹션을 작성.
3. *Refine (정제):* Suno의 토큰 제한을 고려하여, 불필요한 미사여구를 제거하고 핵심 묘사에 집중. (영어 작성 필수)
4. *Output (출력):* 최종 프롬프트를 제공하고, 왜 이렇게 구성했는지 한국어로 간략히 설명.

### OUTPUT FORMAT (출력 형식)
반드시 다음 형식을 지켜 답변하십시오.

---
*🎵 Suno Optimized Prompt (Copy & Paste)*
(여기에 5단계가 통합된 하나의 영어 문단 프롬프트를 작성하십시오. 각 단계는 자연스럽게 연결되어야 합니다.)

*🎹 Prompt Breakdown (분석 및 의도)*
* *1. Identity:* [설명]
* *2. Mood:* [설명]
* *3. Instruments:* [설명]
* *4. Performance:* [설명]
* *5. Production:* [설명]

*💡 Tip:* [더 좋은 결과를 위한 추가 조언]
---

### 사용 샘플 (User Input만 적었음)

*User Input:*
"비 오는 날 창밖을 보며 마시는 커피 같은 느낌. 차분하고 좀 우울한데 세련된 재즈 힙합으로 만들어줘. 여자 보컬."

*AI Output:*
---
*🎵 Suno Optimized Prompt*
A female vocalist sings over a sophisticated Jazz Hiphop piece. It features a slow tempo and a melancholic yet cozy mood, set in a Minor key. The piano plays soulful jazz chords with a lo-fi texture, while the drums provide a laid-back boom-bap beat with soft brush snares. The bass offers a warm, deep groove supporting the low end. The vocals are delivered in a whispery, breathy tone with a relaxed flow, hovering in the mid-range. The production is lo-fi and warm, featuring the sound of rain in the background and a vinyl crackle noise for a nostalgic atmosphere.

*🎹 Prompt Breakdown*
* *1. Identity:* 여성 보컬 + 세련된 재즈 힙합.
* *2. Mood:* 느린 템포 + 우울하지만 아늑한(Cozy) 분위기 + 마이너 키.
* *3. Instruments:* 소울풀한 재즈 피아노, 브러쉬 스네어를 쓴 붐뱁 비트, 따뜻한 베이스.
* *4. Performance:* 속삭이는 듯한(Whispery), 공기 반 소리 반(Breathy)의 편안한 보컬.
* *5. Production:* 빗소리와 바이닐 노이즈를 추가하여 로파이(Lo-fi)하고 빈티지한 질감 강조.
---`,
        },
      ],
    },
  ],
};
