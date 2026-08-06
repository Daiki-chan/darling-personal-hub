# Darling Personal Hub

Personal hub tối màu dùng Next.js App Router, gồm thư viện ảnh, Music Hub và portfolio.

## Các route chính

- `/`: cổng vào ba không gian
- `/thu-vien`: thư viện ảnh
- `/am-nhac`: YouTube-powered Personal Music Hub
- `/portfolio`: dự án và thông tin liên hệ

## Kiến trúc Music Hub

```text
YouTube Data API v3 -> /api/youtube/search -> metadata
YouTube IFrame API -> YouTubeVideoStage -> playback chính thức
MusicPlayerProvider -> queue, history, favorites, playlists, repeat, shuffle
LRCLIB -> /api/music/lyrics -> synced hoặc plain lyrics
IndexedDB -> player state và thư viện cá nhân
Darling UI -> Obsidian AMOLED, ambient color, simulated visualizer
```

Music Hub chỉ dùng một YouTube IFrame Player instance. Iframe luôn hiển thị trong player dock hoặc expanded player và không có audio proxy, direct media URL hay thẻ `<audio>` cho nội dung YouTube.

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

Mở `http://localhost:3000/am-nhac`.

## Kiểm tra production

```bash
npm run typecheck
npm run build
npm run start
```

Repository hiện không cài ESLint hoặc test runner riêng. TypeScript strict và production build là hai cổng kiểm tra tĩnh đang được cấu hình.

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

Trang nhạc dùng TasteSkill được cài tại `.agents/skills/design-taste-frontend/SKILL.md` theo hướng redesign audit-first. Theme `/am-nhac` khóa ở Obsidian AMOLED `#050505`; màu nhấn và ambient glow lấy từ thumbnail bài đang phát, có fallback xác định theo `videoId`.
