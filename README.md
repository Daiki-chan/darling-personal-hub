# Darling Personal Hub

Một personal hub tối, điện ảnh và tối giản, được chia thành ba không gian độc lập cho ảnh, nhạc và công việc.

## Các trang

- `/`: Cổng giới thiệu tương tác ba bước
- `/thu-vien`: Thư viện những hình ảnh yêu thích
- `/am-nhac`: Thư viện track, album và playlist yêu thích
- `/portfolio`: Dự án, quy trình và liên hệ công việc

## Công nghệ

- Next.js 16 với App Router
- React 19 và TypeScript
- Framer Motion cho chuyển cảnh và reveal
- Lucide React cho icon
- Native CSS với responsive layout

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` trong trình duyệt.

## Production build

```bash
npm run build
npm run start
```

## Thay placeholder

- Ảnh: cập nhật các vị trí `MediaPlaceholder` trong `app/thu-vien/page.tsx` và `app/portfolio/page.tsx`.
- Nhạc: cập nhật danh sách track và nguồn audio trong `components/music-deck.tsx`.

## Theme

Toàn bộ website sử dụng một dark theme với nền obsidian, violet là màu tương tác chính và indigo là màu khí quyển hỗ trợ.
