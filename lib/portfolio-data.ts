// CHÚ THÍCH: Toàn bộ số liệu, mô tả và chi tiết bên dưới là DỮ LIỆU CASE STUDY DEMO / PLACEHOLDER.
// Được cấu trúc sạch sẽ để dễ dàng thay thế bằng số liệu portfolio thật trong tương lai.

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
  mediaVariant: "search" | "content" | "analytics" | "technical" | "local" | "growth";
  aspectRatio?: "portrait" | "landscape" | "wide" | "square";
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
    slug: "organic-search-growth-system",
    index: "01",
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
    index: "02",
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
    index: "03",
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
    index: "04",
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
    index: "05",
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
    index: "06",
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
    overview: "Sprint cắt tỉa và làm mới nội dung hướng tới các bài viết bị sụt giảm traffic tự nhiên.",
    challenge: "Các bài viết cũ mất thứ hạng vào tay đối thủ cạnh tranh có nội dung cập nhật hơn.",
    insight: "Cập nhật cấu trúc ý định và thêm bảng/danh sách có cấu trúc mở ra cơ hội lấy vị trí Top 0.",
    strategy: "Tập trung vào các bài viết có lượt hiển thị cao nhưng CTR thấp để cập nhật ý định.",
    execution: ["Audit hiệu suất truy vấn GSC", "Lập brief làm mới nội dung", "Tối ưu định dạng cho Snippet"],
    results: "Chiếm lĩnh 14 vị trí Featured Snippet và phục hồi lưu lượng truy cập sụt giảm.",
    learnings: "Làm mới nội dung hiện có thường mang lại ROI nhanh hơn việc xuất bản bài viết mới từ đầu.",
  },
];

export const PROFILE_DATA = {
  name: "PHẠM HOÀNG PHÚC",
  role: "Marketing / SEO Specialist",
  experience: "2 Năm Kinh Nghiệm",
  location: "Việt Nam / GMT+7",
  headline: "SEO KHÔNG CHỈ LÀ THỨ HẠNG. MÀ LÀ ĐƯỢC THẤY ĐÚNG LÚC NGUYÊN NGUYỆN.",
  body: "Tôi là Phạm Hoàng Phúc, Chuyên viên Marketing & SEO với 2 năm kinh nghiệm trong chiến lược tìm kiếm, tối ưu nội dung và marketing kỹ thuật số hướng tới hiệu suất. Tôi yêu thích việc biến ý định tìm kiếm, nội dung và dữ liệu thành cơ hội tăng trưởng thực tế.",
  focusAreas: [
    "SEO Strategy",
    "Content SEO",
    "Keyword Research",
    "On-page Optimization",
    "Competitor Research",
    "Performance Analysis",
  ],
  tools: [
    "Google Search Console",
    "Google Analytics 4",
    "Ahrefs",
    "Semrush",
    "Screaming Frog",
    "Google Keyword Planner",
    "Looker Studio",
  ],
};

export const APPROACH_STEPS = [
  {
    number: "01",
    title: "KHÁM PHÁ (DISCOVER)",
    subtitle: "Nghiên cứu thị trường tìm kiếm & ý định",
    details: "Phân tích khoảng trống đối thủ, truy vấn tìm kiếm thực tế và ý định đằng sau các chủ đề ngành.",
  },
  {
    number: "02",
    title: "CẤU TRÚC (STRUCTURE)",
    subtitle: "Sơ đồ từ khóa & kiến trúc nội dung",
    details: "Xây dựng cụm chủ đề, xác định trang trụ cột và thiết lập phân cấp liên kết nội bộ ngữ cảnh.",
  },
  {
    number: "03",
    title: "TỐI ƯU (OPTIMIZE)",
    subtitle: "Tinh chỉnh On-page & SERP",
    details: "Tối ưu chất lượng nội dung, metadata, dữ liệu cấu trúc schema và tín hiệu kỹ thuật để tối đa độ hiển thị.",
  },
  {
    number: "04",
    title: "ĐO LƯỜNG (MEASURE)",
    subtitle: "Theo dõi dữ liệu & góc nhìn hiệu suất",
    details: "Giám sát lượt hiển thị, click, thứ hạng và chuyển đổi tự nhiên qua Google Search Console và GA4.",
  },
  {
    number: "05",
    title: "THỬ NGHIỆM (ITERATE)",
    subtitle: "Tinh chỉnh & nhân rộng tăng trưởng",
    details: "Thử nghiệm lại thẻ tiêu đề, cập nhật nội dung sụt giảm và mở rộng các chiến lược chứng minh ROI cao.",
  },
];

export const CAPABILITIES_DATA = {
  primary: [
    "Chiến lược SEO",
    "Nghiên cứu Từ khóa",
    "Content SEO",
    "Tối ưu On-page",
    "Phân tích Đối thủ",
    "Ý định Tìm kiếm",
    "Liên kết Nội bộ",
    "Báo cáo SEO",
  ],
  secondary: [
    "Digital Marketing",
    "Lập Kế hoạch Chiến dịch",
    "Tối ưu Trang đích",
    "CRO Cơ bản",
    "Phân tích Dữ liệu GA4",
    "Lập Kế hoạch Nội dung",
  ],
  tools: [
    "GA4",
    "Google Search Console",
    "Ahrefs",
    "Semrush",
    "Screaming Frog",
    "Looker Studio",
    "Google Trends",
    "Keyword Planner",
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
    summary: "Tập trung xây dựng các hệ thống tăng trưởng tự nhiên có khả năng nhân rộng kết hợp SEO, nội dung và tư duy chuyển đổi.",
  },
];

export const NUMBERS_DATA = [
  { number: "02", label: "NĂM KINH NGHIỆM" },
  { number: "03", label: "CASE STUDY NỔI BẬT" },
  { number: "20+", label: "THỬ NGHIỆM SEO & CONTENT" },
  { number: "∞", label: "ĐIỀU CẦN HỌC HỎI" },
];
