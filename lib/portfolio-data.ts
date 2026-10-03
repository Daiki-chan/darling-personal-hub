// CHÚ THÍCH: Toàn bộ số liệu, mô tả và chi tiết bên dưới là DỮ LIỆU CASE STUDY & HỆ THỐNG.
// Được cấu trúc chuẩn mực để phản ánh chính xác các dự án thực tế và năng lực chuyên môn.

export interface Metric {
  value: string;
  label: string;
}

export function savePortfolioNavigationState(archiveView?: "index" | "grid") {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      "portfolio:return-state",
      JSON.stringify({
        scrollY: window.scrollY,
        timestamp: Date.now(),
        archiveView: archiveView || "index",
        source: "portfolio",
      })
    );
  } catch {
    // Ignore storage quota or disabled errors gracefully
  }
}

export interface CaseStudySection {
  title: string;
  content: string;
}

export type MediaVariant = "system" | "search" | "content" | "analytics" | "technical" | "local" | "growth";

export interface Project {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  client: string;
  featured: boolean;
  summary: string;
  role: string[];
  duration: string;
  metrics: Metric[];
  mediaVariant: MediaVariant;
  aspectRatio?: "portrait" | "landscape" | "wide" | "square";
  capabilities?: string[];
  overview?: string;
  challenge?: string;
  insight?: string;
  strategy?: string;
  execution?: string[];
  results?: string;
  learnings?: string;
}

export const FEATURED_PROJECTS: Project[] = [
  {
    slug: "darling-personal-hub",
    index: "01",
    title: "DARLING PERSONAL HUB",
    category: "DIGITAL EXPERIENCE / CREATIVE SYSTEM",
    year: "2026",
    client: "Dự án Cá nhân / Creative Workspace",
    featured: true,
    summary:
      "Hệ thống không gian số cá nhân đa chiều kết hợp cổng typographic chuyển cảnh, trình phát nhạc acoustic thời gian thực và kho lưu trữ đồ họa tối giản.",
    role: ["Creative Technologist", "Frontend Architecture", "Motion Engineering"],
    duration: "2025 — 2026",
    metrics: [
      { value: "0.08s", label: "TTFB RESPONSE" },
      { value: "100/100", label: "LIGHTHOUSE PERFORMANCE" },
      { value: "60 FPS", label: "COMPOSITOR FLUIDITY" },
      { value: "0 CLS", label: "LAYOUT STABILITY" },
    ],
    mediaVariant: "system",
    aspectRatio: "landscape",
    capabilities: ["WEB", "UX", "MOTION", "SYSTEM"],
    overview:
      "Darling Personal Hub là một không gian trải nghiệm số đa chiều, tích hợp các thực thể độc lập (Memories, Music, Portfolio) trong một ngôn ngữ thiết kế Obsidian AMOLED đơn sắc đồng nhất.",
    challenge:
      "Xây dựng một hệ thống đa tính năng vừa có tính nghệ thuật điện ảnh cao vừa duy trì hiệu năng tải trang tức thì, zero layout shift và khả năng tương thích toàn diện trên thiết bị di động.",
    insight:
      "Một portfolio hiện đại không chỉ là bản trình chiếu tĩnh các dự án trong quá khứ, mà chính nó phải là minh chứng sống động nhất cho năng lực tư duy, thẩm mỹ và kỹ thuật của người tạo ra nó.",
    strategy:
      "Áp dụng kiến trúc Next.js App Router kết hợp View Transitions, hệ thống token chuyển động chuẩn hóa và rendering tối ưu phần cứng compositor.",
    execution: [
      "Thiết kế ngôn ngữ thị giác Obsidian Monochrome với độ tương phản cao",
      "Xây dựng cổng typographic chuyển cảnh với mặt nạ slit-scan spatial",
      "Phát triển trình phát nhạc âm thanh tích hợp đồng bộ lời bài hát thời gian thực",
      "Tối ưu hóa toàn bộ pipeline chuyển động bằng GPU transforms và clearProps",
      "Thiết lập ma trận kiểm thử E2E tự động với Playwright và Vitest",
    ],
    results:
      "Đạt điểm số hiệu năng tối đa 100/100 trên Lighthouse, thời gian tải trang dưới 0.1s và trải nghiệm chuyển cảnh mượt mà 60fps trên mọi thiết bị.",
    learnings:
      "Kỷ luật kỹ thuật và sự tiết chế trong thiết kế thị giác là chìa khóa để tạo nên một sản phẩm số trường tồn và khác biệt.",
  },
  {
    slug: "organic-search-growth-system",
    index: "02",
    title: "HỆ THỐNG TĂNG TRƯỞNG TÌM KIẾM TỰ NHIÊN",
    category: "SEO STRATEGY / CONTENT / ANALYTICS",
    year: "2026",
    client: "Thương hiệu Tiêu dùng / Dự án Mẫu",
    featured: true,
    summary:
      "Xây dựng khung nội dung dẫn dắt bởi tìm kiếm, tập trung mở rộng độ hiển thị tự nhiên trên các nhóm từ khóa có ý định chuyển đổi cao.",
    role: ["Chiến lược SEO", "Kế hoạch Nội dung", "Tối ưu hóa"],
    duration: "6 Tháng",
    metrics: [
      { value: "+148%", label: "LƯỢT CLICK TỰ NHIÊN" },
      { value: "+96%", label: "ĐỘ HIỂN THỊ NON-BRAND" },
      { value: "32", label: "TỪ KHÓA MỤC TIÊU TOP 10" },
      { value: "6 THÁNG", label: "THỜI GIAN ĐO LƯỜNG" },
    ],
    mediaVariant: "search",
    aspectRatio: "landscape",
    capabilities: ["SEO STRATEGY", "INTENT MAPPING", "CONTENT PLANNING"],
    overview:
      "Một chiến dịch tối ưu hóa công cụ tìm kiếm toàn diện nhằm mở rộng lưu lượng truy cập tự nhiên non-brand cho một ngành bán lẻ cạnh tranh.",
    challenge:
      "Lượng truy cập tự nhiên phụ thuộc quá nhiều vào nhóm từ khóa thương hiệu (brand keywords), trong khi các chủ đề thương mại quan trọng có độ hiển thị yếu.",
    insight:
      "Nhu cầu tìm kiếm tồn tại ở nhiều giai đoạn trong hành trình khách hàng, nhưng nội dung hiện tại chưa kết nối rõ ràng giữa ý định tìm hiểu và các trang mua hàng.",
    strategy:
      "Xây dựng cụm chủ đề (topic clusters) xung quanh nhóm tìm kiếm có ý định cao và cải thiện liên kết giữa nội dung thông tin với trang đích chuyển đổi.",
    execution: [
      "Phân tích khoảng trống và sơ đồ hóa ý định từ khóa",
      "Tối ưu hóa brief nội dung cho các thuật ngữ tiềm năng cao",
      "Đồng bộ hóa cấu trúc dữ liệu schema & các yếu tố On-page",
      "Thiết lập mạng lưới liên kết nội bộ giữa trang trụ cột và trang đích",
      "Tối ưu tỷ lệ nhấp SERP CTR thông qua thử nghiệm tiêu đề & thẻ meta",
    ],
    results:
      "+148% lượt click tự nhiên trên các cụm từ khóa mục tiêu, với 32 từ khóa chính bứt phá vào Top 10 kết quả tìm kiếm.",
    learnings:
      "Cấu trúc nội dung xung quanh cụm ý định người dùng giúp xây dựng uy tín tìm kiếm dài hạn nhanh hơn so với việc định hướng từ khóa đơn lẻ.",
  },
  {
    slug: "content-cluster-experiment",
    index: "03",
    title: "THỬ NGHIỆM CỤM NỘI DUNG (CONTENT CLUSTER)",
    category: "CONTENT SEO / SEARCH INTENT",
    year: "2025",
    client: "Trang tin Kỹ thuật số / Dự án Mẫu",
    featured: true,
    summary:
      "Thiết kế chiến lược cụm chủ đề kết nối nhu cầu tìm kiếm thông tin với các trang đích thương mại có giá trị cao.",
    role: ["Kiến trúc Chủ đề", "Phân tích SERP", "Liên kết Nội bộ"],
    duration: "4 Tháng",
    metrics: [
      { value: "24", label: "BÀI VIẾT CHUYÊN SÂU" },
      { value: "+72%", label: "PHIÊN TRUY CẬP TỰ NHIÊN" },
      { value: "4.1 → 7.8%", label: "CTR NỘI BỘ" },
      { value: "18", label: "TỪ KHÓA TOP 10" },
    ],
    mediaVariant: "content",
    aspectRatio: "portrait",
    capabilities: ["TOPIC CLUSTERS", "SERP OPTIMIZATION", "SEMANTIC LINKING"],
    overview:
      "Một kiến trúc nội dung thử nghiệm ánh xạ các câu hỏi của khách hàng trực tiếp tới trang trung tâm (hub) và các tài sản có tỷ lệ chuyển đổi cao.",
    challenge:
      "Nội dung được xuất bản rời rạc thiếu phân cấp chủ đề, gây ra hiện tượng ăn bớt từ khóa (cannibalization) và giá trị giới thiệu nội bộ thấp.",
    insight:
      "Công cụ tìm kiếm thưởng cho uy tín chủ đề khi các bài viết hỗ trợ thiết lập mối quan hệ ngữ nghĩa rõ ràng với bài viết trụ cột (pillar).",
    strategy:
      "Tái cấu trúc các chủ đề xuất bản thành 3 trung tâm nội dung cốt lõi với dòng chảy liên kết nội bộ ngữ nghĩa chặt chẽ.",
    execution: [
      "Kiểm duyệt 50+ bài viết hiện có để phát hiện sự chồng chéo ý định",
      "Thiết kế 3 bản thiết kế trang trụ cột (pillar page) nền tảng",
      "Tái cấu trúc 24 bài viết hỗ trợ với thẻ tiêu đề phụ ngữ nghĩa",
      "Triển khai các đoạn kêu gọi hành động ngữ cảnh dẫn người dùng đến trang quyết định",
    ],
    results:
      "Số phiên truy cập tự nhiên tăng +72%, với tỷ lệ nhấp liên kết nội bộ tăng gần gấp đôi từ 4.1% lên 7.8%.",
    learnings:
      "Ý định tìm kiếm thay đổi theo phễu mua hàng; các hub nội dung là cầu nối giữa sự khám phá và quyết định chuyển đổi.",
  },
  {
    slug: "search-to-conversion",
    index: "04",
    title: "TỪ TÌM KIẾM ĐẾN CHUYỂN ĐỔI",
    category: "SEO / CRO / PERFORMANCE",
    year: "2025",
    client: "Thương mại Điện tử / Dự án Mẫu",
    featured: true,
    summary:
      "Kế thừa phân tích ý định tìm kiếm, tối ưu hóa trang đích và theo dõi hiệu suất để cải thiện hành trình từ lượt truy cập tự nhiên đến hành động có ý nghĩa.",
    role: ["CRO Trang đích", "Khớp Ý định Tìm kiếm", "Theo dõi GA4"],
    duration: "5 Tháng",
    metrics: [
      { value: "+41%", label: "CTR TRANG ĐÍCH" },
      { value: "+28%", label: "TỶ LỆ CHUYỂN ĐỔI" },
      { value: "-19%", label: "TỶ LỆ THOÁT (BOUNCE)" },
      { value: "3", label: "CHU KỲ TỐI ƯU HÓA" },
    ],
    mediaVariant: "analytics",
    aspectRatio: "wide",
    capabilities: ["CRO", "LANDING PAGE OPTIMIZATION", "GA4 TELEMETRY"],
    overview:
      "Dự án kết hợp giữa SEO và Tối ưu hóa Tỷ lệ Chuyển đổi (CRO) nhằm biến lượt truy cập tìm kiếm tự nhiên thành chuyển đổi kinh doanh đo lường được.",
    challenge:
      "Trang đích tạo ra lượng truy cập tự nhiên tốt nhưng không hướng dẫn người dùng thực hiện các bước kêu gọi hành động chính.",
    insight:
      "Người dùng đến từ tìm kiếm tự nhiên cần sự đảm bảo ngay lập tức ở khu vực đầu trang rằng trang web giải đáp đúng truy vấn của họ trước khi hành động.",
    strategy:
      "Đồng bộ hóa thông điệp đầu trang (above-the-fold) với các từ khóa hàng đầu và tinh gọn luồng chuyển đổi chính.",
    execution: [
      "Sơ đồ hóa các điểm thoát của người dùng qua luồng hành vi GA4",
      "Thiết kế lại khu vực Hero cho các trang đích có ý định mua cao",
      "Đơn giản hóa biểu mẫu nhận tin và làm nổi bật giá trị cốt lõi",
      "Thử nghiệm A/B thông điệp tiêu đề khớp với các truy vấn tìm kiếm",
    ],
    results:
      "+41% tỷ lệ nhấp trên trang đích và tăng +28% tổng số chuyển đổi tự nhiên.",
    learnings:
      "Lưu lượng truy cập mới chỉ là một nửa trận đánh; sự ăn khớp giữa ý định tìm kiếm và trải nghiệm sau lượt nhấp mới tạo ra tăng trưởng thực sự.",
  },
];

export const ARCHIVE_PROJECTS: Project[] = [
  ...FEATURED_PROJECTS,
  {
    slug: "local-search-visibility",
    index: "05",
    title: "Chiến dịch Độ hiển thị Tìm kiếm Địa phương",
    category: "Local SEO / Google Maps",
    year: "2025",
    client: "Chuỗi Bán lẻ Đa điểm / Dự án Mẫu",
    featured: false,
    summary: "Tối ưu hóa tín hiệu thực thể địa phương, Google Business Profiles và các trang đích theo khu vực địa lý.",
    role: ["Local SEO", "Tối ưu GMB"],
    duration: "3 Tháng",
    metrics: [
      { value: "+115%", label: "HIỂN THỊ MAP PACK" },
      { value: "+64%", label: "YÊU CẦU CHỈ ĐƯỜNG" },
    ],
    mediaVariant: "local",
    capabilities: ["LOCAL SEO", "GOOGLE MAPS", "SCHEMA GEO"],
    overview: "Chiến lược tìm kiếm địa phương tập trung vào khả năng khám phá cửa hàng và xếp hạng Map Pack.",
    challenge: "Các điểm bán hàng vật lý thiếu tính đồng nhất về tín hiệu địa phương và thông tin NAP.",
    insight: "Các truy vấn gần đây yêu cầu tín hiệu nội dung địa phương hóa và sự quản lý tích cực trên Google Business Profile.",
    strategy: "Chuẩn hóa danh mục địa phương và xây dựng trang đích dành riêng cho từng vị trí.",
    execution: ["Kiểm duyệt hồ sơ Google Business Profile", "Làm sạch trích dẫn địa phương", "Tối ưu schema trang vị trí"],
    results: "Tăng hơn 100% lượt hiển thị Map Pack trên các thành phố mục tiêu.",
    learnings: "Uy tín tìm kiếm địa phương phụ thuộc lớn vào sự nhất quán của thực thể và các tín hiệu tương tác khách hàng.",
  },
  {
    slug: "technical-seo-audit",
    index: "06",
    title: "Kiểm duyệt Kỹ thuật & Kiến trúc Thu thập Dữ liệu",
    category: "Technical SEO",
    year: "2024",
    client: "Nền tảng SaaS / Dự án Mẫu",
    featured: false,
    summary: "Giải quyết nút thắt ngân sách thu thập (crawl budget), lỗi canonicalization và hiệu quả lập chỉ mục.",
    role: ["Audit Kỹ thuật", "Kiến trúc Sitemap"],
    duration: "2 Tháng",
    metrics: [
      { value: "-45%", label: "TỶ LỆ LỖI CRAWL" },
      { value: "+80%", label: "TRANG ĐÃ LẬP CHỈ MỤC" },
    ],
    mediaVariant: "technical",
    capabilities: ["CRAWL EFFICIENCY", "CANONICAL AUDIT", "INDEXING SYSTEM"],
    overview: "Audit kỹ thuật xử lý kiến trúc trang sâu và hiệu quả thu thập dữ liệu cho website hơn 10.000 trang.",
    challenge: "Bot tìm kiếm lãng phí ngân sách crawl vào các URL tham số trong khi trang đích quan trọng chưa được lập chỉ mục.",
    insight: "Cấu hình Robots và thẻ canonical nội bộ xung đột với XML sitemaps.",
    strategy: "Làm sạch các chỉ thị lập chỉ mục và tái cấu trúc đường dẫn liên kết nội bộ.",
    execution: ["Audit toàn bộ trang với Screaming Frog", "Tái cấu trúc Robots.txt & XML sitemap", "Sửa lỗi xử lý tham số & Canonical"],
    results: "Hiệu quả lập chỉ mục tăng 80% và giảm gần một nửa số lỗi crawl.",
    learnings: "Vệ sinh kỹ thuật là nền tảng cho phép nội dung và liên kết phát huy tối đa hiệu quả.",
  },
  {
    slug: "performance-content-sprint",
    index: "07",
    title: "Tối ưu Hiệu suất Nội dung & Làm mới SERP",
    category: "Content / Analytics",
    year: "2024",
    client: "B2B Tech / Dự án Mẫu",
    featured: false,
    summary: "Kiểm duyệt các tài sản nội dung cũ để cập nhật truy vấn mới và chiếm lĩnh các vị trí Featured Snippet.",
    role: ["Audit Nội dung", "Tối ưu Snippet"],
    duration: "3 Tháng",
    metrics: [
      { value: "14", label: "FEATURED SNIPPET CHIẾM LĨNH" },
      { value: "+38%", label: "PHỤC HỒI CTR" },
    ],
    mediaVariant: "growth",
    capabilities: ["CONTENT AUDIT", "FEATURED SNIPPETS", "SERP RECOVERY"],
    overview: "Sprint cắt tỉa và làm mới nội dung hướng tới các bài viết bị sụt giảm traffic tự nhiên.",
    challenge: "Các bài viết cũ mất thứ hạng vào tay đối thủ cạnh tranh có nội dung cập nhật hơn.",
    insight: "Cập nhật cấu trúc ý định và thêm bảng/danh sách có cấu trúc mở ra cơ hội lấy vị trí Top 0.",
    strategy: "Tập trung vào các bài viết có lượt hiển thị cao nhưng CTR thấp để cập nhật ý định.",
    execution: ["Audit hiệu suất truy vấn GSC", "Lập brief làm mới nội dung", "Tối ưu định dạng cho Snippet"],
    results: "Chiếm lĩnh 14 vị trí Featured Snippet và phục hồi lưu lượng truy cập sụt giảm.",
    learnings: "Làm mới nội dung hiện có thường mang lại ROI nhanh hơn việc xuất bản bài viết mới từ đầu.",
  },
];

export const WHAT_I_BUILD_DATA = [
  {
    index: "01",
    title: "DIGITAL EXPERIENCE",
    subtitle: "Websites · Interactive interfaces · Personal systems",
    description: "Thiết kế và phát triển các sản phẩm web cao cấp với tính thẩm mỹ điện ảnh, cấu trúc typography chuẩn mực và tốc độ phản hồi tức thì.",
    deliverables: [
      "Websites & Web Apps hiệu năng cao",
      "Interactive interfaces & Micro-interactions",
      "Hệ thống định danh số & Design Systems",
      "Kiến trúc giao diện đáp ứng (Responsive)",
    ],
  },
  {
    index: "02",
    title: "GROWTH & SEARCH",
    subtitle: "SEO · Content clusters · Search intent · Traffic systems",
    description: "Xây dựng hệ thống tăng trưởng tự nhiên bền vững dựa trên phân tích ý định tìm kiếm, cấu trúc cụm chủ đề và tối ưu hóa chuyển đổi.",
    deliverables: [
      "Chiến lược SEO & Phân tích khoảng trống từ khóa",
      "Kiến trúc Topic Cluster & Trang trụ cột (Pillar)",
      "Technical SEO, Schema Graph & Crawl Optimization",
      "Đo lường & Phân tích dữ liệu hành vi GA4 / GSC",
    ],
  },
  {
    index: "03",
    title: "INTERACTION & MOTION",
    subtitle: "GSAP motion · Fluid dynamics · Spatial choreography",
    description: "Tạo chiều sâu xúc giác và nhịp điệu thị giác qua chuyển động có kiểm soát, tối ưu hóa phần cứng GPU và tôn trọng giảm chuyển động.",
    deliverables: [
      "Choreography chuyển động GSAP mượt mà",
      "Hiệu ứng chuyển cảnh trang (Page Transitions)",
      "Tương tác phản hồi haptic & trạng thái chuột",
      "Tối ưu hóa Compositor & 60fps Frame Budget",
    ],
  },
  {
    index: "04",
    title: "EXPERIMENTS & PROTOTYPES",
    subtitle: "Creative web · Audio interfaces · Tooling experiments",
    description: "Không ngừng khám phá các biên giới công nghệ mới: âm thanh trên trình duyệt, không gian điều hướng lạ và các công cụ thực nghiệm số.",
    deliverables: [
      "Trình phát nhạc Web Audio & Lyric Sync",
      "Cổng không gian chuyển cảnh Spatial Slit-Mask",
      "Mẫu thử nghiệm công cụ cá nhân & Workspaces",
      "Benchmark hiệu năng và đo lường telemetry",
    ],
  },
];

export interface ExperimentItem {
  index: string;
  title: string;
  tag: string;
  description: string;
  href: string;
  status: "LIVE SYSTEM" | "ACTIVE" | "PROTOTYPE";
  technologies: string[];
}

export const EXPERIMENTS_DATA: ExperimentItem[] = [
  {
    index: "01",
    title: "UNKNOWN / PORTAL GATEWAY",
    tag: "SPATIAL INTERFACE",
    description: "Cổng điều hướng tương tác đa tầng sử dụng mặt nạ slit-scan spatial, typography kích thước lớn và hiệu ứng thị sai xúc giác.",
    href: "/#portals",
    status: "LIVE SYSTEM",
    technologies: ["GSAP Timeline", "Kinetic Sora", "Spatial Mask", "CSS ViewTransition"],
  },
  {
    index: "02",
    title: "AUDIO HUB / ACOUSTIC SYSTEM",
    tag: "WEB AUDIO & REALTIME LRC",
    description: "Không gian nghe nhạc đắm chìm tích hợp YouTube headless streaming, đồng bộ lời bài hát từng mili-giây và cơ học đĩa vinyl quay.",
    href: "/music",
    status: "LIVE SYSTEM",
    technologies: ["Web Audio API", "LRC Parser", "Vinyl Rotor Physics", "Headless Player"],
  },
  {
    index: "03",
    title: "MEMORIES / CHRONICLE ARCHIVE",
    tag: "EDITORIAL FILM GALLERY",
    description: "Kho lưu trữ hình ảnh điện ảnh với bố cục bento bất đối xứng, ống kính khẩu độ spatial và bộ lọc đơn sắc ấm.",
    href: "/memories",
    status: "LIVE SYSTEM",
    technologies: ["Aperture Lens", "Bento Grid", "Monochrome Filter", "Fluid Viewport"],
  },
  {
    index: "04",
    title: "GPU MOTION & TELEMETRY ENGINE",
    tag: "PERFORMANCE FRAMEWORK",
    description: "Kiến trúc chuyển động độc quyền: GPU transforms, will-change kiểm soát nghiêm ngặt, zero layout shift và bộ dọn dẹp lifecycle tự động.",
    href: "/portfolio",
    status: "ACTIVE",
    technologies: ["Compositor Shader", "Zero CLS", "Lifecycle Guard", "Hardware Acceleration"],
  },
];

export const PROFILE_DATA = {
  name: "PHẠM HOÀNG PHÚC",
  role: "Marketing / SEO Specialist & Creative Technologist",
  experience: "2+ Năm Kinh Nghiệm Thực Chiến",
  location: "TP. Hồ Chí Minh, Việt Nam // GMT+7",
  headline: "XÂY DỰNG TRẢI NGHIỆM SỐ NƠI THIẾT KẾ, CÔNG NGHỆ VÀ TĂNG TRƯỞNG GẶP NHAU.",
  body: "Tôi là Phạm Hoàng Phúc. Tôi xây dựng các trải nghiệm kỹ thuật số kết hợp giữa tư duy thiết kế tinh tế, nền tảng kỹ thuật hiện đại và chiến lược tăng trưởng hữu cơ. Tập trung vào các hệ thống web cá nhân, thương mại điện tử và tối ưu hóa tìm kiếm tự nhiên.",
  focusAreas: [
    "Digital Experience",
    "SEO & Search Intent",
    "Content Architecture",
    "Web Motion & Performance",
    "Conversion Optimization",
    "Personal Workspaces",
  ],
  tools: [
    "Next.js & React",
    "GSAP Motion",
    "Google Search Console",
    "Google Analytics 4",
    "Ahrefs & Semrush",
    "Looker Studio",
    "Figma",
  ],
};

export const APPROACH_STEPS = [
  {
    idx: "01",
    name: "SEARCH",
    sub: "DISCOVERY",
    desc: "Tìm kiếm cơ hội tăng trưởng từ hành vi thực tế và nhu cầu chưa được đáp ứng của người dùng.",
  },
  {
    idx: "02",
    name: "INTENT",
    sub: "ANALYSIS",
    desc: "Giải mã mục đích tìm kiếm (Intent) đằng sau từng cụm từ khóa và truy vấn dữ liệu thực tế.",
  },
  {
    idx: "03",
    name: "STRUCTURE",
    sub: "ARCHITECTURE",
    desc: "Xây dựng kiến trúc nội dung và cụm chủ đề chuẩn SEO có khả năng mở rộng quy mô bền vững.",
  },
  {
    idx: "04",
    name: "TEST",
    sub: "EXPERIMENT",
    desc: "Thử nghiệm A/B tiêu đề, cấu trúc trang đích và các điểm chuyển đổi trọng yếu.",
  },
  {
    idx: "05",
    name: "MEASURE",
    sub: "TELEMETRY",
    desc: "Đo lường tỷ lệ chuyển đổi GA4 và tinh chỉnh chiến lược tăng trưởng theo thời gian thực.",
  },
];

export const CAPABILITIES_DATA = {
  primary: [
    "Web Experience",
    "Chiến lược SEO",
    "Nghiên cứu Từ khóa",
    "Content Cluster",
    "Tối ưu On-page",
    "Ý định Tìm kiếm",
    "Motion & Tương tác",
    "Báo cáo & Phân tích",
  ],
  secondary: [
    "Digital Marketing",
    "Lập Kế hoạch Chiến dịch",
    "Tối ưu Trang đích",
    "CRO Chuyển đổi",
    "Phân tích Dữ liệu GA4",
    "Thiết kế Giao diện UI",
  ],
  tools: [
    "Next.js",
    "GSAP",
    "GA4",
    "Google Search Console",
    "Ahrefs",
    "Semrush",
    "Screaming Frog",
    "Looker Studio",
  ],
};

export const EXPERIENCE_TIMELINE = [
  {
    year: "2024",
    summary: "Bắt đầu làm việc trong lĩnh vực tối ưu hóa nội dung, nghiên cứu từ khóa và thực thi marketing kỹ thuật số.",
  },
  {
    year: "2025",
    summary: "Mở rộng sang chiến lược SEO, phân tích hiệu suất và lập kế hoạch nội dung dẫn dắt bởi ý định tìm kiếm.",
  },
  {
    year: "2026",
    summary: "Tập trung xây dựng các hệ thống không gian số cá nhân, tăng trưởng tự nhiên có khả năng nhân rộng và tương tác web cao cấp.",
  },
];

export const NUMBERS_DATA = [
  { number: "02+", label: "NĂM KINH NGHIỆM" },
  { number: "04", label: "CASE STUDY CHUYÊN SÂU" },
  { number: "20+", label: "THỬ NGHIỆM SỐ & SEO" },
  { number: "∞", label: "ĐIỀU CẦN HỌC HỎI" },
];
