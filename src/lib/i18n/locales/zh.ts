import type { Dict } from "../dict";

export const zh: Dict = {
  meta: {
    title: "Mattecut — 不用上传就能抠掉图片背景",
    description:
      "一个在浏览器里运行的背景去除工具。图片不会发往任何服务器，不用排队，结果按原始分辨率下载。",
    studioTitle: "工作台",
    studioDescription:
      "放入一张图片，抠出主体，然后把背景换成任意颜色或渐变。",
    notFoundTitle: "没有这个页面",
    notFoundBody: "链接可能打错了，也可能这个页面从来就不存在。",
    backHome: "回到首页",
  },
  common: {
    openStudio: "打开工作台",
    sourceCode: "源代码",
    readCode: "阅读代码",
    close: "关闭",
    skipToContent: "跳到正文",
  },
  theme: {
    label: "外观",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
  },
  lang: { label: "语言" },
  hero: {
    badge: "在你的设备上运行",
    titleA: "留下主体。",
    titleB: "扔掉其余。",
    lead: "Mattecut 直接在浏览器里抠掉图片背景。文件从不离开你的设备，因此没有排队，没有每日额度，也没有什么关于照片去向的说法需要你凭信任接受。",
    cta: "抠第一张图",
    note: "无需账号 · 无需上传 · 没有水印",
    caption: "Alpha matte · 8 位",
  },
  pillars: [
    {
      title: "在本机处理",
      body: "分割模型通过 WebAssembly 在你自己的浏览器里运行。图片碰不到我们的服务器，因为另一端根本没有服务器接收它。",
    },
    {
      title: "原始分辨率",
      body: "你下载的是按源文件尺寸输出的结果。预览可以为了速度而缩小，但导出始终是从完整数据重新合成的。",
    },
    {
      title: "断网也能用",
      body: "第一次的模型下载在浏览器里存下来之后，后面的图片即使断网也照样处理。",
    },
  ],
  steps: {
    eyebrow: "使用流程",
    heading: "四个步骤，没有隐藏环节",
    items: [
      {
        title: "放入图片",
        body: "把文件拖到投放区、从剪贴板粘贴，或者从手机相册里挑一张。JPG、PNG 和 WebP，最大 12 MB。",
      },
      {
        title: "等待抠图",
        body: "模型把主体和背景分开。普通照片几秒就好，进度条显示的是真正在跑的阶段，不是编出来的数字。",
      },
      {
        title: "设定新背景",
        body: "保持透明、从色板里挑一个颜色、自己输入 HEX 或 rgb()，或者用渐变。预览会立刻变化。",
      },
      {
        title: "下载",
        body: "要透明背景就用 PNG，需要轻量文件用 JPG，追求最小体积用 WebP。",
      },
    ],
  },
  features: {
    eyebrow: "里面有什么",
    items: [
      {
        title: "HEX 和 rgb() 都收",
        body: "颜色输入框接受 #FF0000、#F00、rgb(255, 0, 0)，想要半透明背景时还可以用 rgba()。输错会被标出来，而不是悄悄忽略。",
      },
      {
        title: "可以拖动的对比",
        body: "一条分隔线，用来判断抠图的好坏。鼠标、手指和方向键都能用。",
      },
      {
        title: "三种导出格式",
        body: "PNG 保留 alpha 通道。JPG 和 WebP 是为了那些你只需要一个小文件传去别处的时候准备的。",
      },
    ],
  },
  limits: {
    eyebrow: "局限",
    heading: "动手之前值得知道的事",
    items: [
      {
        title: "首次要下载 54 MB",
        body: "分割模型得先进到浏览器里。只有一次，之后就存着了。流量有限的话，请在 Wi-Fi 下完成。",
      },
      {
        title: "旧设备会更慢",
        body: "计算压在你的手机或笔记本上，而不是服务器上。入门级手机每张图可能要十几秒。",
      },
      {
        title: "细发丝依然是难题",
        body: "精细模式在柔和边缘上干净得多，但当背景颜色和主体接近时，没有哪个模型是完美的。",
      },
    ],
  },
  closer: {
    heading: "打开一张图，自己看看",
    body: "前面没有注册这一关。打开工作台，放进文件，就完了。",
  },
  footer: {
    tagline: "做出来是为了让你用它时不必把照片交给任何人。",
  },
  studio: {
    onDevice: "正在本机处理",
    back: "回到首页",
    dropTitle: "把图片放在这里",
    dropBody: "把文件拖进这个区域、从剪贴板粘贴，或者用下面的按钮。",
    pick: "选择图片",
    formats: "JPG · PNG · WEBP — 最大 12 MB",
    qualityLabel: "质量",
    applyModel: "使用此模型",
    liteTitle: "超轻量",
    liteNote:
      "{mb} MB 模型 · 下载最小，发丝边缘最粗",
    lightTitle: "轻量",
    lightNote:
      "{mb} MB 模型 · 下载较小，边缘比超轻量更锐利",
    balancedTitle: "均衡",
    balancedNote:
      "{mb} MB 模型 · 折中选择，足够应付大多数照片",
    maximumTitle: "最高",
    maximumNote:
      "{mb} MB 模型 · 头发与柔和边缘最干净",
    auditOpen: "查看模型清单",
    auditResult:
      "在来源处读到 {models} 个模型。最小 {small} 字节，最大 {big} 字节 — 这个范围之外没有别的。",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "上面每个档位的数字是模型加上 {rt} MB 的运行时，因为实际下载的就是这个总和。",
    auditNote:
      "这是按下按钮那一刻从来源服务器读取的，不是写在这个应用里的数字。想再核对一次，重新载入即可。",
    auditFailed:
      "清单读取失败 — 网络中断或来源拒绝了请求。上面各档位标注的大小目前没有得到证实。",
    downloadPng: "下载 PNG",
    transparentSuffix: "透明",
    exportNote: "始终按原始分辨率导出，而不是预览的尺寸。",
    exportNoteCapped:
      "已按 {w} × {h} px 导出，小于原图：此设备无法让完整分辨率通过模型。",
    lowPower:
      "此设备报告内存或处理器核心有限，因此默认选择最轻的模型，并在处理前将照片的长边缩小到 {px} px。所有档位仍可选择。",
    another: "换一张图",
    restored: "标签页关闭后，已恢复你上次的结果。",
    modelNote: "随时切换模型，将在同一张图上重新抠图。",
    attireLabel: "着装",
    attireNone: "不加西装",
    attire: [
      "炭灰西装",
      "藏青西装",
      "无领带西装外套",
    ],
    attireAuto:
      "根据抠图中的肩线与颈部自动摆放。",
    attireManual:
      "这张照片读不出肩线，请自行调整大小和高度。",
    attireSize: "大小",
    attireDrop: "高度",
    firstDownloadNote:
      "这次 {mb} MB 的下载只发生一次。存进浏览器之后，后面的图片完全不用联网就能处理。",
    errUnsupported: "还不支持这个格式。请使用 JPG、PNG 或 WebP。",
    errTooBig: "{mb} MB 的文件超过了 12 MB 上限。请先压小一点。",
    errFailed: "图片处理失败。换一个文件再试试。",
    errExport: "没能准备好要下载的文件。",
    errDecode: "结果无法作为图片读取。",
  },
  progress: {
    downloading: "正在把模型下载到本机",
    engine: "正在浏览器里启动引擎",
    separating: "正在把主体和背景分开",
    done: "完成",
    working: "进行中…",
    preparing: "准备中…",
  },
  compare: {
    before: "原图",
    after: "Mattecut",
    sliderLabel: "拖动以对比处理前后",
    altBefore: "处理之前的原图",
    altAfter: "去掉背景之后的结果",
  },
  bg: {
    bgLabel: "背景",
    gradientLabel: "渐变",
    customLabel: "自定颜色",
    transparent: "透明",
    wheel: "从色轮里挑选",
    spectrum: "色彩光谱",
    hue: "色相",
    alpha: "不透明度",
    count: "16,777,216 种颜色",
    hint: "接受 HEX 和 rgb()，想要半透明背景也可以用 rgba()。",
    invalid: "没读懂这个值。试试 #FF0000、#F00 或 rgb(255, 0, 0)。",
    presets: [
      "白",
      "黑",
      "影棚灰",
      "暗房红灯",
      "证件照蓝",
      "证件照红",
      "绿幕",
      "米色",
    ],
    gradients: ["黄昏", "薄雾", "午夜", "海"],
    wallpaperLabel: "背景图",
    wallpapers: [
      "影棚灰",
      "证件蓝",
      "石墨",
      "暖沙",
      "天空",
      "鼠尾草",
    ],
    upload: "自己的图片",
    uploadHint: "文件留在这台设备上",
    catalogueOpen:
      "浏览全部背景",
    catalogueTitle:
      "背景目录",
    catalogueCount:
      "{n} 个背景，在此设备上生成——无需下载",
    catalogueByCount:
      "{n} 张 CC BY 照片——可自由使用，但必须标明作者",
    creditRequired:
      "无论在何处分享，都必须标明：{credit}",
    cataloguePhotoCount:
      "{n} 张照片，公有领域或 CC0，由本站提供",
    catalogueTabGradients: "颜色",
    catalogueTabPhotos: "照片",
    catalogueSearch:
      "搜索：blue、soft、deep teal、gradient、#1f6fff",
    catalogueEmpty:
      "没有匹配项。试试颜色名称或十六进制代码。",
    catalogueFailed:
      "无法加载照片列表。请检查网络后重试。",
    creditShown:
      "无论在何处分享成果，请标明此照片：{credit}",
    fitCover: "填满",
    fitContain: "适应",
  },
};
