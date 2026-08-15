# Darling Personal Hub

Personal hub tối màu dùng Next.js App Router, gồm thư viện ảnh, Music Hub và portfolio.

## Các route chính

- `/`: cổng vào ba không gian
- `/thu-vien`: redirect tự động sang `/memories`
- `/memories`: Black Label Thematic Memory Archive
- `/am-nhac`: redirect tự động sang `/music`
- `/music`: YouTube-powered Personal Music Hub
- `/portfolio`: dự án và thông tin liên hệ

## Kiến trúc Music Hub

```text
YouTube Data API v3 -> search, Trending Vietnam, Auto Radio
YouTube IFrame API -> YouTubeVideoStage -> playback chính thức
Root MusicShell + MusicPlayerProvider -> persistent player, queue, volume, radio
LRCLIB -> staged exact/field/broad lookup -> scored lyrics candidates
IndexedDB -> player state và thư viện cá nhân
Darling UI -> Obsidian AMOLED, ambient color, simulated visualizer
```

Music Hub chỉ dùng một YouTube IFrame Player instance. Iframe luôn hiển thị trong player dock hoặc expanded player và không có audio proxy, direct media URL hay thẻ `<audio>` cho nội dung YouTube.

Player được mount trong root layout nên cùng iframe, queue và tiến trình phát tồn tại khi điều hướng SPA sang route khác. Dock compact hiển thị ngoài `/music`; expanded player và mobile bottom sheet dùng lại chính node player đó.

Volume dùng thang 0-100 đồng nhất với YouTube IFrame API và lưu `previousVolume` để mute/unmute. Trending Vietnam cache 30 phút; Auto Radio chỉ chạy sau queue và repeat; lựa chọn lyrics thủ công được lưu theo từng `videoId`.

## Chạy local

Yêu cầu Node.js tương thích với Next.js hiện tại của repository.

```bash
npm install
```

Tạo `.env.local` tại thư mục gốc:

```env
YOUTUBE_API_KEY=your-google-api-key
```

Khởi động:

```bash
npm run dev
```

Mở `http://localhost:3000/music`.

## Kiểm tra production

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run start
```

ESLint dùng cấu hình Core Web Vitals và TypeScript của Next.js 16. Vitest kiểm tra volume, ranking, playback policy, cache Trending và LRCLIB parser/scoring.

## Deploy Vercel

1. Import repository vào Vercel.
2. Thêm `YOUTUBE_API_KEY` trong Project Settings > Environment Variables.
3. Deploy bằng preset Next.js mặc định.
4. Hạn chế API key trong Google Cloud theo YouTube Data API v3 và quota phù hợp.

Route Handler cần runtime server, vì vậy bản export tĩnh hoặc GitHub Pages không phù hợp.

## Giới hạn của YouTube IFrame

- Trình duyệt có thể chặn autoplay cho đến khi người dùng tương tác.
- Chủ video có thể tắt embed hoặc giới hạn theo khu vực.
- Không thể truy cập PCM/FFT từ iframe. Visualizer trong giao diện là chuyển động mô phỏng có seed theo video.
- YouTube giữ quyền hiển thị controls, quảng cáo và thông báo theo chính sách của họ.
- Search phụ thuộc quota của YouTube Data API v3.

## UI

Trang nhạc dùng TasteSkill được cài tại `.agents/skills/design-taste-frontend/SKILL.md` theo hướng redesign audit-first. Theme `/music` khóa ở Obsidian AMOLED `#050505`; màu nhấn và ambient glow lấy từ thumbnail bài đang phát, có fallback xác định theo `videoId`.
