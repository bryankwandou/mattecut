import type { Dict } from "../dict";

export const vi: Dict = {
  meta: {
    title: "Roto — xoá nền ảnh mà không cần tải lên",
    description:
      "Công cụ xoá nền chạy ngay trong trình duyệt. Ảnh không được gửi tới máy chủ nào, không phải xếp hàng, và kết quả tải về ở đúng độ phân giải gốc.",
    studioTitle: "Studio",
    studioDescription:
      "Thả một tấm ảnh, tách chủ thể, rồi đổi nền sang màu hoặc dải chuyển màu bất kỳ.",
    notFoundTitle: "Trang này không tồn tại",
    notFoundBody:
      "Có thể đường dẫn bị gõ sai, hoặc trang đó chưa từng có.",
    backHome: "Về trang chủ",
  },
  common: {
    openStudio: "Mở studio",
    sourceCode: "Mã nguồn",
    readCode: "Đọc mã nguồn",
    close: "Đóng",
    skipToContent: "Bỏ qua tới nội dung",
  },
  theme: {
    label: "Giao diện",
    light: "Sáng",
    dark: "Tối",
    system: "Theo hệ thống",
  },
  lang: { label: "Ngôn ngữ" },
  hero: {
    badge: "Chạy trên thiết bị của bạn",
    titleA: "Giữ lại chủ thể.",
    titleB: "Bỏ đi phần còn lại.",
    lead: "Roto cắt nền ảnh ngay bên trong trình duyệt. Tệp không bao giờ rời khỏi thiết bị của bạn, nên không có hàng đợi, không có hạn mức mỗi ngày, và không có điều gì bạn phải tin suông về chuyện gì xảy ra với tấm ảnh.",
    cta: "Cắt tấm ảnh đầu tiên",
    note: "Không tài khoản · không tải lên · không hình mờ",
    caption: "Alpha matte · 8-bit",
  },
  pillars: [
    {
      title: "Xử lý trên thiết bị",
      body: "Mô hình phân đoạn chạy trong chính trình duyệt của bạn qua WebAssembly. Ảnh không chạm tới máy chủ của chúng tôi, bởi đầu bên kia không có máy chủ nào để nhận cả.",
    },
    {
      title: "Độ phân giải gốc",
      body: "Thứ bạn tải về là kết quả ở đúng kích thước tệp gốc. Bản xem trước có thể thu nhỏ cho nhanh, nhưng bản xuất luôn được dựng lại từ dữ liệu đầy đủ.",
    },
    {
      title: "Chạy được khi mất mạng",
      body: "Sau khi lần tải mô hình đầu tiên được lưu trong trình duyệt, những ảnh sau vẫn xử lý được dù không có kết nối.",
    },
  ],
  steps: {
    eyebrow: "Cách hoạt động",
    heading: "Bốn bước, không giấu gì cả",
    items: [
      {
        title: "Đưa ảnh vào",
        body: "Kéo tệp vào vùng thả, dán từ khay nhớ tạm, hoặc chọn từ thư viện điện thoại. JPG, PNG và WebP tối đa 12 MB.",
      },
      {
        title: "Chờ đường cắt",
        body: "Mô hình tách chủ thể khỏi nền. Ảnh thông thường xong trong vài giây, và thanh tiến trình cho biết bước đang thật sự chạy, không phải con số bịa ra.",
      },
      {
        title: "Chọn nền mới",
        body: "Để trong suốt, chọn một màu trong bảng, tự gõ HEX hoặc rgb(), hoặc dùng dải chuyển màu. Bản xem trước đổi ngay lập tức.",
      },
      {
        title: "Tải về",
        body: "PNG cho nền trong suốt, JPG khi cần tệp nhẹ, WebP khi muốn kích thước nhỏ nhất.",
      },
    ],
  },
  features: {
    eyebrow: "Bên trong có gì",
    items: [
      {
        title: "Nhận cả HEX lẫn rgb()",
        body: "Ô màu nhận #FF0000, #F00, rgb(255, 0, 0), và cả rgba() nếu bạn muốn nền bán trong suốt. Gõ sai sẽ được báo, chứ không bị lặng lẽ bỏ qua.",
      },
      {
        title: "Thanh so sánh kéo được",
        body: "Một đường chia để đánh giá đường cắt. Dùng được bằng chuột, bằng ngón tay, và bằng phím mũi tên.",
      },
      {
        title: "Ba định dạng xuất",
        body: "PNG giữ kênh alpha. JPG và WebP có sẵn cho lúc bạn chỉ cần một tệp nhỏ để đăng lên chỗ khác.",
      },
    ],
  },
  limits: {
    eyebrow: "Giới hạn",
    heading: "Vài điều nên biết trước khi thử",
    items: [
      {
        title: "Lần đầu tải 54 MB",
        body: "Mô hình phân đoạn phải vào trình duyệt trước đã. Chỉ một lần, sau đó được lưu lại. Nếu dung lượng mạng hạn chế, hãy làm qua Wi-Fi.",
      },
      {
        title: "Máy cũ sẽ chậm hơn",
        body: "Phần tính toán nằm trên điện thoại hoặc máy tính của bạn, không phải trên máy chủ. Điện thoại phổ thông có thể mất hơn mười giây mỗi ảnh.",
      },
      {
        title: "Tóc mảnh vẫn khó",
        body: "Chế độ chính xác sạch hơn hẳn ở các mép mềm, nhưng không mô hình nào hoàn hảo khi nền có màu gần giống chủ thể.",
      },
    ],
  },
  closer: {
    heading: "Mở một tấm ảnh và tự xem",
    body: "Không có bước đăng ký chắn đường. Mở studio, thả tệp vào, xong.",
  },
  footer: {
    tagline: "Làm ra để dùng mà không phải giao ảnh của bạn cho ai.",
  },
  studio: {
    onDevice: "Xử lý trên thiết bị này",
    back: "Về trang chủ",
    dropTitle: "Thả ảnh vào đây",
    dropBody:
      "Kéo tệp vào vùng này, dán từ khay nhớ tạm, hoặc dùng nút bên dưới.",
    pick: "Chọn ảnh",
    formats: "JPG · PNG · WEBP — tối đa 12 MB",
    qualityLabel: "Chất lượng",
    lightTitle: "Nhẹ",
    lightNote:
      "Mô hình {mb} MB · nhẹ nhất, cho máy và mạng hạn chế",
    balancedTitle: "Cân bằng",
    balancedNote:
      "Mô hình {mb} MB · lựa chọn ở giữa, đủ cho hầu hết ảnh",
    maximumTitle: "Tối đa",
    maximumNote:
      "Mô hình {mb} MB · sạch nhất ở tóc và viền mềm",
    auditOpen: "Kiểm tra danh mục mô hình",
    auditResult:
      "Đọc được {models} mô hình tại nguồn. Nhỏ nhất {small} byte, lớn nhất {big} byte — không có gì ngoài khoảng đó.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "Con số ở mỗi mức bên trên cộng thêm {rt} MB bộ chạy vào mô hình, vì đó mới là phần thực sự được tải về.",
    auditNote:
      "Đọc từ máy chủ gốc ngay lúc bạn bấm nút, không phải con số viết sẵn trong ứng dụng này. Tải lại trang để kiểm tra lần nữa.",
    auditFailed:
      "Không đọc được danh mục — mạng lỗi hoặc máy chủ gốc từ chối. Các dung lượng ở những mức trên hiện chưa được xác minh.",
    downloadPng: "Tải PNG",
    transparentSuffix: "trong suốt",
    exportNote:
      "Luôn xuất ở độ phân giải gốc, không phải kích thước bản xem trước.",
    another: "Ảnh khác",
    restored: "Kết quả gần nhất đã được khôi phục sau khi thẻ đóng.",
    modelNote: "Đổi mô hình bất cứ lúc nào; phần tách được làm lại trên cùng ảnh.",
    attireLabel: "Trang phục",
    attireNone: "Không áo vest",
    attire: [
      "Vest than chì",
      "Vest xanh navy",
      "Blazer không cà vạt",
    ],
    attireAuto:
      "Đặt tự động theo vai và cổ trên ảnh đã tách nền.",
    attireManual:
      "Không đọc được vai trong ảnh này. Hãy tự chỉnh kích thước và độ cao.",
    attireSize: "Kích thước",
    attireDrop: "Độ cao",
    firstDownloadNote:
      "Lần tải {mb} MB này chỉ diễn ra một lần. Sau khi được lưu trong trình duyệt, những ảnh sau được xử lý mà không cần mạng.",
    errUnsupported: "Định dạng đó chưa được hỗ trợ. Hãy dùng JPG, PNG hoặc WebP.",
    errTooBig: "Tệp {mb} MB vượt giới hạn 12 MB. Hãy thu nhỏ trước.",
    errFailed: "Không xử lý được ảnh. Thử lại với tệp khác.",
    errExport: "Không chuẩn bị được tệp để tải về.",
    errDecode: "Không đọc được kết quả dưới dạng ảnh.",
  },
  progress: {
    downloading: "Đang tải mô hình về thiết bị",
    engine: "Đang khởi động bộ máy trong trình duyệt",
    separating: "Đang tách chủ thể khỏi nền",
    done: "Xong",
    working: "đang chạy…",
    preparing: "Đang chuẩn bị…",
  },
  compare: {
    before: "Ảnh gốc",
    after: "Roto",
    sliderLabel: "Kéo để so sánh trước và sau",
    altBefore: "Ảnh gốc trước khi xử lý",
    altAfter: "Kết quả sau khi nền đã bị xoá",
  },
  bg: {
    bgLabel: "Nền",
    gradientLabel: "Chuyển màu",
    customLabel: "Màu tự chọn",
    transparent: "Trong suốt",
    wheel: "Chọn từ bánh xe màu",
    spectrum: "Quang phổ màu",
    hue: "Sắc độ",
    alpha: "Độ đục",
    count: "16.777.216 màu",
    hint: "Nhận HEX và rgb(), kể cả rgba() nếu muốn nền bán trong suốt.",
    invalid: "Chưa đọc được. Thử #FF0000, #F00 hoặc rgb(255, 0, 0).",
    presets: [
      "Trắng",
      "Đen",
      "Xám studio",
      "Đèn buồng tối",
      "Xanh ảnh thẻ",
      "Đỏ ảnh thẻ",
      "Phông xanh",
      "Kem",
    ],
    gradients: ["Hoàng hôn", "Sương", "Nửa đêm", "Biển"],
    wallpaperLabel: "Ảnh nền",
    wallpapers: [
      "Xám studio",
      "Xanh hộ chiếu",
      "Than chì",
      "Cát ấm",
      "Bầu trời",
      "Xanh xô thơm",
    ],
    upload: "Ảnh của bạn",
    uploadHint: "Tệp vẫn ở trên máy này",
    fitCover: "Lấp đầy",
    fitContain: "Vừa khung",
  },
};
