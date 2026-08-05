# Darling Personal Hub

Một personal hub tối, điện ảnh và tối giản, được chia thành ba không gian độc lập cho ảnh, nhạc và công việc.

## Các trang

- `/`: Cổng giới thiệu tương tác ba bước
- `/thu-vien`: Thư viện những hình ảnh yêu thích
- `/am-nhac`: Music Hub với player thu gọn, player toàn màn hình, tìm kiếm và lời đồng bộ
- `/portfolio`: Dự án, quy trình và liên hệ công việc

## Công nghệ

- Next.js 16 với App Router và Route Handler
- React 19 và TypeScript
- Framer Motion cho chuyển cảnh
- Lucide React cho icon
- Canvas và Web Audio API cho visualizer
- Piped API cho tìm kiếm và stream YouTube Music
- LRCLIB cho lời bài hát

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` trong trình duyệt.

## Cấu hình Music Hub

Tạo file `.env.local` ở thư mục gốc:

```env
PIPED_API_BASE_URL=https://pipedapi.kavin.rocks
COBALT_API_URL=https://your-cobalt-api.example
COBALT_API_KEY=
NEXT_PUBLIC_MUSIC_TRACK_ONE_URL=https://your-r2-domain.example/track-one.mp3
NEXT_PUBLIC_MUSIC_TRACK_TWO_URL=https://your-r2-domain.example/track-two.flac
```

`PIPED_API_BASE_URL` có thể trỏ đến Piped instance riêng của bạn. Public instance chỉ phù hợp để bắt đầu và có thể thay đổi trạng thái theo thời gian.

`COBALT_API_URL` là fallback tùy chọn cho stream YouTube. Theo tài liệu Cobalt, bạn cần dùng instance tự host hoặc instance mà chủ sở hữu đã cho phép. Nếu instance yêu cầu API key, đặt thêm `COBALT_API_KEY`.

Danh sách nhạc cá nhân nằm tại `lib/music.ts`. Mỗi track hỗ trợ URL MP3, FLAC hoặc định dạng audio mà trình duyệt có thể phát.

Nếu dùng Cloudflare R2, hãy cho phép domain Vercel của bạn trong CORS. Visualizer cần header `Access-Control-Allow-Origin`, còn player cơ bản có thể phát mà không hiện waveform nếu header này thiếu.

## Production build

```bash
npm run build
npm run start
```

Website cần môi trường server Next.js vì các route `/api/yt-search`, `/api/yt-stream` và `/api/lyrics` chạy phía server. Vercel hỗ trợ cấu hình này trực tiếp. GitHub Pages không chạy được các Route Handler này.

## Thay nội dung

- Ảnh thư viện và portfolio: cập nhật các vị trí `MediaPlaceholder` trong `app/thu-vien/page.tsx` và `app/portfolio/page.tsx`.
- Cover và nhạc cá nhân: cập nhật `lib/music.ts` cùng các file trong `public/music/covers`.
- Piped instance: đặt biến môi trường `PIPED_API_BASE_URL` trên Vercel.
- Cobalt fallback: đặt `COBALT_API_URL` và `COBALT_API_KEY` nếu instance yêu cầu xác thực.

## Theme

Toàn bộ website sử dụng một dark theme với nền obsidian, violet là màu tương tác chính và indigo là màu khí quyển hỗ trợ.
