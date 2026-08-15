# Motion System Todo

## Phase 1: Baseline và foundation

- [x] Task 1: Đọc Next.js 16.3 docs liên quan và thay test Portfolio lỗi thời.
- [x] Task 2: Tạo motion tokens, GSAP registry và shared reveal primitives.
- [x] Task 3: Tạo route transition giữ persistent player sống.

### Checkpoint A

- [x] Typecheck, lint, unit test và route E2E pass.
- [x] Review motion tokens và route transition.

## Phase 2: Portfolio

- [x] Task 4: Củng cố horizontal Selected Work trên desktop.
- [x] Task 5: Đồng bộ Hero, Archive và Method.
- [x] Task 6: Đồng bộ About, Portrait và Contact; bỏ custom cursor.

### Checkpoint B

- [x] Horizontal chỉ tồn tại ở Portfolio desktop.
- [x] Reverse scroll, resize và route restore ổn định.
- [x] Review cảm giác scrub và pin ngang.

## Phase 3: Music

- [x] Task 7: Tối ưu Hero và Kinetic Signal Field.
- [x] Task 8: Thêm vertical choreography cho toàn bộ section.
- [x] Task 9: Hoàn thiện player state motion và image performance.

## Phase 4: Memories

- [x] Task 10: Thêm hero, chapter và card recall choreography.
- [x] Task 11: Sửa Darkroom presence, transition và Epilogue.

### Checkpoint C

- [x] Ba trang dùng cùng motion tokens.
- [x] Music và Memories vertical-only.
- [x] Player, ticker, modal và body lock không leak.

## Phase 5: Final QA

- [x] Task 12: Performance trace, responsive, accessibility và visual regression.
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run test:e2e`
- [x] `npm run build`
- [ ] Human approval trước khi merge.

### Verification 2026-08-16

- Unit: 28/28 pass; E2E: 23/23 pass; production build pass.
- Browser audit: 0 console warning/error trên 3 route ở 1440px và 390px.
- Scroll trace: p95 16.7–16.8ms; 0 frame vượt 24ms.
- Scroll contract: chỉ Portfolio desktop có 1 pin spacer; mobile và reduced motion không pin.
