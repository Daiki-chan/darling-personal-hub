# Motion System Todo

## Phase 1: Baseline và foundation

- [ ] Task 1: Đọc Next.js 16.3 docs liên quan và thay test Portfolio lỗi thời.
- [ ] Task 2: Tạo motion tokens, GSAP registry và shared reveal primitives.
- [ ] Task 3: Tạo route transition giữ persistent player sống.

### Checkpoint A

- [ ] Typecheck, lint, unit test và route E2E pass.
- [ ] Review motion tokens và route transition.

## Phase 2: Portfolio

- [ ] Task 4: Củng cố horizontal Selected Work trên desktop.
- [ ] Task 5: Đồng bộ Hero, Archive và Method.
- [ ] Task 6: Đồng bộ About, Portrait và Contact; bỏ custom cursor.

### Checkpoint B

- [ ] Horizontal chỉ tồn tại ở Portfolio desktop.
- [ ] Reverse scroll, resize và route restore ổn định.
- [ ] Review cảm giác scrub và pin ngang.

## Phase 3: Music

- [ ] Task 7: Tối ưu Hero và Kinetic Signal Field.
- [ ] Task 8: Thêm vertical choreography cho toàn bộ section.
- [ ] Task 9: Hoàn thiện player state motion và image performance.

## Phase 4: Memories

- [ ] Task 10: Thêm hero, chapter và card recall choreography.
- [ ] Task 11: Sửa Darkroom presence, transition và Epilogue.

### Checkpoint C

- [ ] Ba trang dùng cùng motion tokens.
- [ ] Music và Memories vertical-only.
- [ ] Player, ticker, modal và body lock không leak.

## Phase 5: Final QA

- [ ] Task 12: Performance trace, responsive, accessibility và visual regression.
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Human approval trước khi merge.
