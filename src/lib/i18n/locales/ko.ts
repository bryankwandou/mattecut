import type { Dict } from "../dict";

export const ko: Dict = {
  meta: {
    title: "Roto — 업로드 없이 이미지 배경 지우기",
    description:
      "브라우저 안에서 동작하는 배경 제거 도구입니다. 이미지는 어떤 서버로도 전송되지 않고, 대기열도 없으며, 결과는 원본 해상도 그대로 내려받습니다.",
    studioTitle: "스튜디오",
    studioDescription:
      "이미지를 올려놓고 피사체를 잘라낸 뒤, 배경을 원하는 색이나 그러데이션으로 바꾸세요.",
    notFoundTitle: "그런 페이지는 없습니다",
    notFoundBody: "링크에 오타가 있거나, 애초에 없던 페이지일 수 있습니다.",
    backHome: "첫 화면으로",
  },
  common: {
    openStudio: "스튜디오 열기",
    sourceCode: "소스 코드",
    readCode: "코드 보기",
    close: "닫기",
    skipToContent: "본문으로 건너뛰기",
  },
  theme: {
    label: "화면",
    light: "밝게",
    dark: "어둡게",
    system: "시스템 설정 따르기",
  },
  lang: { label: "언어" },
  hero: {
    badge: "내 기기에서 동작합니다",
    titleA: "피사체만 들어내고.",
    titleB: "나머지는 버립니다.",
    lead: "Roto는 브라우저 안에서 이미지 배경을 잘라냅니다. 파일이 기기를 벗어나지 않으니 대기열도, 하루 사용량 제한도 없고, 사진에 무슨 일이 일어나는지 누구의 말을 믿을 필요도 없습니다.",
    cta: "첫 이미지 잘라내기",
    note: "계정 없음 · 업로드 없음 · 워터마크 없음",
    caption: "알파 매트 · 8비트",
  },
  pillars: [
    {
      title: "기기 안에서 처리",
      body: "분할 모델이 WebAssembly를 통해 사용자의 브라우저에서 직접 돌아갑니다. 받아 갈 서버 자체가 없으므로 이미지가 저희 서버에 닿는 일은 없습니다.",
    },
    {
      title: "원본 해상도",
      body: "내려받는 것은 원본 파일 크기 그대로의 결과입니다. 미리보기는 속도를 위해 줄어들 수 있지만, 내보내기는 언제나 전체 데이터에서 다시 만들어집니다.",
    },
    {
      title: "연결 없이도 동작",
      body: "첫 모델 내려받기가 브라우저에 저장되고 나면, 그다음 이미지들은 네트워크가 끊겨도 처리됩니다.",
    },
  ],
  steps: {
    eyebrow: "사용 흐름",
    heading: "네 단계, 숨긴 것 없음",
    items: [
      {
        title: "이미지 가져오기",
        body: "파일을 영역으로 끌어놓거나, 클립보드에서 붙여넣거나, 휴대폰 갤러리에서 고르세요. JPG, PNG, WebP를 12MB까지.",
      },
      {
        title: "잘라내기 기다리기",
        body: "모델이 피사체와 배경을 나눕니다. 보통 사진은 몇 초면 끝나고, 진행 막대는 지어낸 숫자가 아니라 실제로 돌고 있는 단계를 보여줍니다.",
      },
      {
        title: "새 배경 정하기",
        body: "투명하게 두거나, 견본에서 색을 고르거나, HEX나 rgb()를 직접 입력하거나, 그러데이션을 쓰세요. 미리보기는 바로 바뀝니다.",
      },
      {
        title: "내려받기",
        body: "투명 배경이면 PNG, 가벼운 파일이 필요하면 JPG, 가장 작은 크기를 노린다면 WebP.",
      },
    ],
  },
  features: {
    eyebrow: "안에 담긴 것",
    items: [
      {
        title: "HEX와 rgb() 모두",
        body: "색 입력란은 #FF0000, #F00, rgb(255, 0, 0)을 받고, 반투명 배경을 원하면 rgba()도 됩니다. 오타는 조용히 넘어가지 않고 표시됩니다.",
      },
      {
        title: "끌어서 보는 비교",
        body: "잘라낸 결과를 가늠할 구분선 하나. 마우스로도, 손가락으로도, 화살표 키로도 움직입니다.",
      },
      {
        title: "세 가지 내보내기 형식",
        body: "PNG는 알파 채널을 유지합니다. JPG와 WebP는 다른 곳에 올릴 작은 파일만 필요할 때를 위해 있습니다.",
      },
    ],
  },
  limits: {
    eyebrow: "한계",
    heading: "써 보기 전에 알아 둘 것들",
    items: [
      {
        title: "처음 한 번 54MB 내려받기",
        body: "분할 모델이 먼저 브라우저로 들어와야 합니다. 한 번뿐이고 그다음엔 저장된 채로 남습니다. 데이터가 빠듯하다면 Wi-Fi에서 하세요.",
      },
      {
        title: "오래된 기기는 더 느립니다",
        body: "연산 부담이 서버가 아니라 내 휴대폰이나 노트북에 있습니다. 보급형 휴대폰은 이미지당 십여 초가 걸리기도 합니다.",
      },
      {
        title: "가는 머리카락은 여전히 어렵습니다",
        body: "정밀 모드가 부드러운 경계에서 훨씬 깔끔하지만, 배경 색이 피사체와 비슷하면 완벽한 모델은 없습니다.",
      },
    ],
  },
  closer: {
    heading: "이미지 하나 열어 직접 확인해 보세요",
    body: "앞을 막는 가입 절차가 없습니다. 스튜디오를 열고 파일을 놓으면 끝입니다.",
  },
  footer: {
    tagline: "사진을 누구에게도 맡기지 않고 쓰라고 만들었습니다.",
  },
  studio: {
    onDevice: "이 기기에서 처리 중",
    back: "첫 화면으로",
    dropTitle: "여기에 이미지를 놓으세요",
    dropBody:
      "파일을 이 영역으로 끌어오거나, 클립보드에서 붙여넣거나, 아래 버튼을 쓰세요.",
    pick: "이미지 선택",
    formats: "JPG · PNG · WEBP — 최대 12MB",
    qualityLabel: "품질",
    applyModel: "이 모델 사용",
    liteTitle: "초경량",
    liteNote:
      "{mb} MB 모델 · 다운로드가 가장 작고, 머리카락 경계는 가장 거칩니다",
    lightTitle: "가볍게",
    lightNote:
      "{mb} MB 모델 · 다운로드가 작고, 초경량보다 윗선이 선명합니다",
    balancedTitle: "균형",
    balancedNote:
      "{mb} MB 모델 · 중간 선택, 대부분의 사진에 충분",
    maximumTitle: "최고",
    maximumNote:
      "{mb} MB 모델 · 머리카락과 부드러운 가장자리가 가장 깔끔",
    auditOpen: "모델 목록 확인",
    auditResult:
      "원본에서 모델 {models}개를 읽었습니다. 가장 작은 것 {small}바이트, 가장 큰 것 {big}바이트 — 그 범위 밖에는 아무것도 없습니다.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "위 각 단계의 숫자는 모델에 {rt} MB 실행 환경을 더한 값입니다. 실제로 내려받는 것이 그 합이기 때문입니다.",
    auditNote:
      "버튼을 누른 그 순간 원본 서버에서 읽은 값이며, 이 앱에 적어 둔 숫자가 아닙니다. 다시 확인하려면 새로 고침하세요.",
    auditFailed:
      "목록을 읽지 못했습니다 — 네트워크가 실패했거나 원본이 거부했습니다. 위 단계에 적힌 용량은 지금은 확인되지 않은 값입니다.",
    downloadPng: "PNG 내려받기",
    transparentSuffix: "투명",
    exportNote: "미리보기 크기가 아니라 언제나 원본 해상도로 내보냅니다.",
    exportNoteCapped:
      "{w} × {h} px로 내보냈습니다. 원본보다 작은 이유는 이 기기가 전체 해상도를 모델에 통과시키지 못했기 때문입니다.",
    lowPower:
      "이 기기는 메모리나 프로세서 코어가 제한적이라고 알려 왔습니다. 그래서 가장 가벼운 모델이 기본으로 선택되고, 처리 전에 사진의 긴 변을 {px} px로 줄입니다. 모든 단계는 그대로 선택할 수 있습니다.",
    another: "다른 이미지",
    restored: "탭이 닫힌 뒤 마지막 결과를 복원했습니다.",
    modelNote: "모델은 언제든 바꿀 수 있으며, 같은 이미지로 다시 잘라냅니다.",
    attireLabel: "복장",
    attireNone: "재킷 없음",
    attire: [
      "차콜 정장",
      "네이비 정장",
      "넥타이 없는 블레이저",
    ],
    attireAuto:
      "잘라낸 이미지의 어깨와 목에서 자동으로 배치했습니다.",
    attireManual:
      "이 사진에서는 어깨를 읽지 못했습니다. 크기와 높이를 직접 맞춰 주세요.",
    attireSize: "크기",
    attireDrop: "높이",
    firstDownloadNote:
      "이 {mb}MB 내려받기는 한 번뿐입니다. 브라우저에 저장된 뒤로는 다음 이미지들이 네트워크 없이 처리됩니다.",
    errUnsupported: "그 형식은 아직 지원하지 않습니다. JPG, PNG, WebP를 써 주세요.",
    errTooBig: "{mb}MB 파일은 12MB 제한을 넘습니다. 먼저 줄여 주세요.",
    errFailed: "이미지를 처리하지 못했습니다. 다른 파일로 다시 시도해 보세요.",
    errExport: "내려받을 파일을 준비하지 못했습니다.",
    errDecode: "결과를 이미지로 읽을 수 없습니다.",
  },
  progress: {
    downloading: "모델을 기기로 내려받는 중",
    engine: "브라우저에서 엔진을 켜는 중",
    separating: "피사체를 배경에서 분리하는 중",
    done: "완료",
    working: "진행 중…",
    preparing: "준비 중…",
  },
  compare: {
    before: "원본",
    after: "Roto",
    sliderLabel: "끌어서 처리 전후를 비교합니다",
    altBefore: "처리 전 원본 이미지",
    altAfter: "배경을 지운 뒤의 결과",
  },
  bg: {
    bgLabel: "배경",
    gradientLabel: "그러데이션",
    customLabel: "직접 지정한 색",
    transparent: "투명",
    wheel: "색상환에서 고르기",
    spectrum: "색 스펙트럼",
    hue: "색상",
    alpha: "불투명도",
    count: "16,777,216 색",
    hint: "HEX와 rgb()를 받습니다. 반투명 배경을 원하면 rgba()도 됩니다.",
    invalid: "읽지 못했습니다. #FF0000, #F00, rgb(255, 0, 0)을 시도해 보세요.",
    presets: [
      "흰색",
      "검정",
      "스튜디오 회색",
      "암실등",
      "증명사진 파랑",
      "증명사진 빨강",
      "그린 스크린",
      "크림",
    ],
    gradients: ["해질녘", "안개", "한밤", "바다"],
    wallpaperLabel: "배경 이미지",
    wallpapers: [
      "스튜디오 그레이",
      "여권 블루",
      "그래파이트",
      "웜 샌드",
      "스카이",
      "세이지",
    ],
    upload: "내 이미지",
    uploadHint: "파일은 이 기기에 남습니다",
    catalogueOpen:
      "모든 배경 보기",
    catalogueTitle:
      "배경 카탈로그",
    catalogueCount:
      "배경 {n}개. 이 기기에서 생성되며 다운로드는 없습니다.",
    catalogueByCount:
      "CC BY 사진 {n}장. 자유롭게 쓸 수 있지만 저작자를 밝혀야 합니다.",
    creditRequired:
      "이것을 공유하는 모든 곳에 표기가 필요합니다: {credit}",
    cataloguePhotoCount:
      "사진 {n}장. 퍼블릭 도메인 또는 CC0이며 이 사이트에서 제공됩니다.",
    catalogueTabGradients: "색상",
    catalogueTabPhotos: "사진",
    catalogueSearch:
      "검색: blue, soft, deep teal, gradient, #1f6fff",
    catalogueEmpty:
      "일치하는 항목이 없습니다. 색이름이나 16진수 코드를 시도해 보세요.",
    catalogueFailed:
      "사진 목록을 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.",
    creditShown:
      "결과물을 공유하는 모든 곳에 이 사진의 출처를 밝혀 주세요: {credit}",
    fitCover: "채우기",
    fitContain: "맞추기",
  },
};
