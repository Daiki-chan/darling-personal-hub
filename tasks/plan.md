# Implementation Plan: Đồng bộ motion cho Music, Memories và Portfolio

## 1. Design read

Reading this as: ba không gian của cùng một personal hub, phục vụ người xem sáng tạo và nhà tuyển dụng, với ngôn ngữ dark editorial-technical, cần một motion system premium và có kiểm soát nhưng vẫn giữ cá tính riêng của từng trang.

- Redesign mode: targeted evolution. Giữ nguyên route, IA, nội dung chính, dữ liệu và chức năng.
- `DESIGN_VARIANCE: 8`: giữ bố cục editorial bất đối xứng đang có.
- `MOTION_INTENSITY: 8`: thêm choreography theo scroll, route transition và state transition có chủ đích.
- `VISUAL_DENSITY: 5`: không tăng thêm số lượng block hoặc hiệu ứng trang trí.
- Motion personality: Premium. Chuyển động chậm vừa, chính xác, không bounce, không lạm dụng loop.

## 2. Mục tiêu

Xây một motion architecture dùng chung cho `/music`, `/memories` và `/portfolio`:

- Cùng nhịp vào trang, reveal section, phản hồi hover/focus, outro và reduced-motion.
- Music và Memories chỉ cuộn dọc theo viewport.
- Portfolio giữ một đoạn vertical-to-horizontal pin ở Selected Work trên desktop, sau đó trở lại cuộn dọc.
- Duy trì native scroll. Không thêm Lenis, ScrollSmoother hoặc global scroll hijack ở giai đoạn này.
- GSAP + ScrollTrigger chịu trách nhiệm cho scroll choreography và timeline phức tạp.
- Framer Motion chỉ dùng cho presence/state transition như route shell, player state và darkroom viewer.
- Không để GSAP và Framer Motion cùng điều khiển một DOM node.
- Tất cả animation phải có reduced-motion fallback và cleanup khi đổi route.

## 3. Baseline đã audit

| Trang | Desktop 1440x1000 | Mobile 390x844 | Motion hiện tại | Vấn đề chính |
|---|---:|---:|---|---|
| Music | 3,166px | 8,204px | Page fade-in, signal ticker, track-change timeline | Không có section choreography; ticker tiếp tục khi hero offscreen; playhead animate `left`; có 2 cảnh báo Next Image ở desktop |
| Memories | 3,099px | 3,107px | Hover CSS và modal opacity 220ms | Không có scroll reveal; featured image đổi tức thì; exit của darkroom không chạy do `AnimatePresence` nằm sau early return; smooth scroll chưa tôn trọng reduced motion |
| Portfolio | 9,485px | 7,122px | Hero, horizontal pin, một số section reveal, contact timeline | Motion giữa các section không đồng đều; pin ngang thêm 2,880px scroll; inactive spread dùng blur lớn; custom cursor; test E2E chứa nhiều selector của UI cũ |

Runtime hiện tại không có horizontal overflow ở cả ba route trên desktop và mobile. Portfolio desktop tạo một `pin-spacer` cao khoảng 3,870px cho showcase gồm phần hiển thị và 2,880px hành trình ngang.

## 4. Motion language dùng chung

### 4.1 Token

| Token | Giá trị mục tiêu | Dùng cho |
|---|---:|---|
| Quick | 120-180ms | press, icon, focus feedback |
| Standard | 320-460ms | card, image swap, route exit |
| Section | 520-700ms | heading, media aperture, list reveal |
| Hero | 760-950ms | title mask và hero choreography |
| Stagger | 45-80ms | list/card cascade, tổng dưới 500ms |
| Signature ease | `power3.out` / `[0.16, 1, 0.3, 1]` | khoảng 80% entrance |
| Exit ease | `power2.in` | route/modal exit |
| Scroll scrub | 0.65-0.85s | Portfolio horizontal, parallax nhẹ |

### 4.2 Quy tắc choreography

1. Hero: metadata vào trước, title mask reveal, media/evidence vào sau 80-140ms.
2. Section: hairline hoặc heading dẫn nhịp, nội dung chính theo sau, CTA cuối cùng.
3. Reveal thường chạy một lần trong một visit. Scroll-linked animation và Portfolio horizontal phải reversible.
4. Chỉ animate `transform`, `opacity`, `clip-path` khi diện tích nhỏ. Không animate `top`, `left`, `width`, `height` cho chuyển động.
5. Không dùng blur động trên panel full viewport.
6. Không có nhiều hơn một ambient loop nổi bật trong cùng viewport.
7. Reduced motion: bỏ pin, scrub, parallax, ticker và mask; nội dung hiển thị ngay.

### 4.3 Cá tính theo trang

- Music: motion có nhịp như tín hiệu âm thanh. Ticker chỉ hoạt động khi đang phát và hero thực sự visible.
- Memories: motion chậm, ít biên độ, ưu tiên image mask, crossfade và cảm giác recall.
- Portfolio: motion chính xác, có lực, dùng section pin và tiến trình tuyến tính. Chỉ trang này có horizontal storytelling.

## 5. Architecture decisions

- Tạo `lib/motion/tokens.ts` làm nguồn duy nhất cho duration, ease, distance và stagger.
- Tạo `lib/motion/gsap.ts` để register plugin một lần và giữ setup client-safe.
- Tạo motion primitives dạng client leaf: page transition, section reveal, line reveal và media reveal.
- Route transition đặt bên trong persistent `MusicPlayerProvider`, chỉ animate content của ba route. Player không remount và playback không bị ngắt.
- Dùng native document scroll. Smoothness đến từ compositor transforms, scrub có damping và số lượng trigger hạn chế.
- Portfolio horizontal tính distance từ `track.scrollWidth - viewportWidth`, không giả định mọi spread luôn bằng nhau.
- Dùng `gsap.matchMedia()` cho desktop/mobile/reduced-motion và `useGSAP()` hoặc `gsap.context()` cho cleanup.
- Giữ nội dung DOM visible theo mặc định. JavaScript chỉ nâng cấp animation, không làm content biến mất vĩnh viễn khi JS lỗi.
- Mặc định bỏ custom cursor của Portfolio. Thay bằng native cursor, magnetic micro-feedback cục bộ và media hover có giới hạn.

## 6. Dependency graph

```text
Next.js 16.3 docs review
        |
        v
Motion tokens + GSAP registry + reduced-motion contract
        |
        +--> Route motion boundary, persistent player safety
        |
        +--> Portfolio horizontal foundation
        |       |
        |       v
        |   Portfolio vertical choreography
        |
        +--> Music hero/signal foundation
        |       |
        |       v
        |   Music section/player choreography
        |
        +--> Memories hero/chapter foundation
                |
                v
            Darkroom transitions
        |
        v
Cross-page performance, responsive, a11y and visual QA
```

## 7. Task list

### Task 1: Khóa baseline và thay test Portfolio lỗi thời

**Description:** Đọc guide Next.js 16.3 liên quan đến layout, template, Link, navigation, client boundaries và view transitions trước khi viết code. Thay các selector E2E không còn tồn tại bằng test phản ánh UI hiện tại của cả ba trang.

**Acceptance criteria:**

- Test xác nhận Music và Memories chỉ cuộn dọc; Portfolio chỉ pin ngang trên desktop.
- Test responsive chạy ở 360, 390, 412, 768, 1366 và 1920px, không có document overflow ngang.
- Test không tham chiếu selector đã bị xóa như grid toggle, old hint hoặc old showcase classes.

**Verification:**

- `npm run test:e2e -- tests/e2e/portfolio-navigation-scroll.spec.ts`
- Manual review guide trong `node_modules/next/dist/docs/01-app/` trước khi triển khai route shell.

**Dependencies:** None

**Files likely touched:**

- `tests/e2e/portfolio-navigation-scroll.spec.ts`
- `tests/e2e/motion-system.spec.ts`

**Estimated scope:** Small

### Task 2: Xây motion foundation dùng chung

**Description:** Tạo token, GSAP registry và primitives để ba trang dùng cùng duration, easing, trigger threshold, stagger và reduced-motion behavior.

**Acceptance criteria:**

- Có một nguồn token duy nhất, không copy duration/ease mới vào từng component.
- Primitives hỗ trợ reveal một lần, scroll-linked progress và reduced-motion static state.
- Mọi timeline được scoped và revert khi unmount.

**Verification:**

- Unit test token contract.
- `npm run typecheck`
- `npm run lint`

**Dependencies:** Task 1

**Files likely touched:**

- `lib/motion/tokens.ts`
- `lib/motion/gsap.ts`
- `components/motion/section-reveal.tsx`
- `components/motion/media-reveal.tsx`
- `tests/unit/motion-tokens.test.ts`

**Estimated scope:** Medium

### Task 3: Đồng bộ route transition nhưng giữ player sống

**Description:** Thêm route motion boundary chỉ cho Music, Memories và Portfolio bên trong persistent music shell. Transition phải nhẹ, không chặn navigation, không reset playback và không phá scroll restoration.

**Acceptance criteria:**

- Route exit 180-260ms, route enter 380-520ms, không có blank frame dài.
- Music đang phát tiếp tục phát khi chuyển route.
- Reduced motion hiển thị route mới tức thì.
- Back/forward giữ đúng scroll contract của Portfolio.

**Verification:**

- E2E route switching khi player đang active.
- E2E back/forward qua Portfolio case study.
- Console không có hydration warning.

**Dependencies:** Task 2

**Files likely touched:**

- `components/motion/route-motion-boundary.tsx`
- `components/music/music-shell.tsx`
- `app/layout.tsx`
- `tests/e2e/route-motion.spec.ts`

**Estimated scope:** Medium

### Checkpoint A: Foundation

- [ ] Typecheck, lint, unit test và route E2E pass.
- [ ] Player không remount qua ba route.
- [ ] Human review motion tokens và route transition trước khi triển khai từng trang.

### Task 4: Củng cố horizontal scroll của Portfolio

**Description:** Giữ Selected Work là horizontal storytelling duy nhất. Tính distance theo kích thước thật, giảm work trong `onUpdate`, bỏ blur full viewport và đảm bảo mobile là vertical stack.

**Acceptance criteria:**

- Desktop pin bắt đầu ở `top top`, scrub 0.65-0.85, đi đúng từ spread 1 đến spread cuối.
- Scroll reverse không nhảy, không tạo pin spacer trùng sau route revisit hoặc resize.
- Mobile và reduced motion không pin, không transform track theo trục X.
- Active index chỉ cập nhật khi index thật sự thay đổi.

**Verification:**

- E2E forward, reverse, resize và repeated navigation.
- Screenshot tại đầu, giữa, cuối showcase ở 1366x768 và 1920x1080.
- Performance trace không ghi nhận long task do horizontal animation.

**Dependencies:** Task 2

**Files likely touched:**

- `components/portfolio/horizontal-showcase.tsx`
- `app/globals.css`
- `tests/e2e/portfolio-navigation-scroll.spec.ts`

**Estimated scope:** Medium

### Task 5: Đồng bộ hero, archive và method của Portfolio

**Description:** Áp shared hero choreography và section rhythm. Archive reveal theo hàng có giới hạn; Method chuyển active descriptor bằng state transition thay vì đổi nội dung tức thì.

**Acceptance criteria:**

- Hero theo đúng thứ tự metadata, title, evidence field.
- Archive và Method dùng cùng threshold, duration và stagger với hệ thống chung.
- Method interaction có feedback cho hover, click và keyboard, không reflow.
- Không có content hidden nếu animation không khởi tạo.

**Verification:**

- Keyboard test cho Method tabs.
- Scroll up/down lặp lại không tạo trigger mới.
- Reduced motion snapshot hiển thị đầy đủ nội dung.

**Dependencies:** Tasks 2 and 4

**Files likely touched:**

- `components/portfolio/portfolio-hero.tsx`
- `components/portfolio/portfolio-archive.tsx`
- `components/portfolio/portfolio-approach.tsx`
- `app/globals.css`

**Estimated scope:** Medium

### Task 6: Đồng bộ About, portrait và Contact của Portfolio

**Description:** Thêm media reveal cho portrait, stagger có kiểm soát cho capability/timeline và outro choreography. Bỏ custom cursor, giữ native interaction feedback.

**Acceptance criteria:**

- About có một sequence rõ, không animate mọi item cùng lúc.
- Contact text, action và footnote vào theo cùng motion grammar.
- Contact vẫn visible khi JS fail hoặc reduced motion bật.
- Custom cursor không render; không còn mousemove listener toàn trang.

**Verification:**

- E2E contact visible ở normal, reduced motion và JS-disabled snapshot.
- Browser console sạch khi vào/ra Portfolio nhiều lần.

**Dependencies:** Task 5

**Files likely touched:**

- `components/portfolio/portfolio-about.tsx`
- `components/portfolio/portrait-aperture.tsx`
- `components/portfolio/portfolio-contact.tsx`
- `components/portfolio/custom-cursor.tsx`
- `app/globals.css`

**Estimated scope:** Medium

### Checkpoint B: Portfolio

- [ ] Horizontal chỉ tồn tại ở Portfolio desktop.
- [ ] Reverse scroll, resize và route restore đều ổn định.
- [ ] Không có blur animation full viewport hoặc custom cursor loop.
- [ ] Human review cảm giác pin ngang trước khi triển khai Music và Memories.

### Task 7: Nâng hero và signal engine của Music

**Description:** Đồng bộ hero entrance với Portfolio nhưng giữ ngôn ngữ signal riêng. Tối ưu ticker, playhead và track-change timeline.

**Acceptance criteria:**

- Hero metadata, title và signal field vào theo shared hero sequence.
- Signal ticker chỉ chạy khi track đang phát, tab visible và hero intersects viewport.
- Playhead dùng transform hoặc scale, không animate `left` theo mỗi clock tick.
- Track change không jump và không để tween cạnh tranh với ambient drift.

**Verification:**

- Unit test phase pause/resume contract nếu logic được tách ra.
- Performance trace khi phát nhạc và scroll khỏi hero.
- Reduced motion không register ticker.

**Dependencies:** Task 2

**Files likely touched:**

- `components/music/music-archive-hero.tsx`
- `components/music/kinetic-signal-field.tsx`
- `components/music/music-app.module.css`
- `tests/e2e/music-motion.spec.ts`

**Estimated scope:** Medium

### Task 8: Thêm vertical choreography cho toàn bộ Music

**Description:** Dùng shared section reveals cho Search, Discover, For You, Archive, Playlists và Queue. Giữ mọi hành trình trang là vertical; không thêm rail hoặc page-level horizontal scroll.

**Acceptance criteria:**

- Mỗi section có heading lead-in và content reveal có động cơ rõ ràng.
- Discover card reveal được batch, tổng stagger dưới 500ms.
- Hai sticky area hiện tại không xung đột nav hoặc player dock.
- Mobile 390px không bị scroll quá nặng do animation và không có overflow ngang.

**Verification:**

- E2E scroll toàn trang desktop/mobile.
- Screenshot Search, Discover, For You và Archive ở các viewport chính.
- Trigger count ổn định sau rerender dữ liệu trending.

**Dependencies:** Task 7

**Files likely touched:**

- `components/music/music-app.tsx`
- `components/music/music-home.tsx`
- `components/music/library-panel.tsx`
- `components/music/queue-panel.tsx`
- `components/music/music-app.module.css`

**Estimated scope:** Medium

### Task 9: Hoàn thiện player state motion và image performance của Music

**Description:** Đồng bộ compact/expanded dock transition, giữ focus/inert chính xác và xử lý hai cảnh báo Next Image đã thấy trong runtime audit.

**Acceptance criteria:**

- Compact, expanded và dismissed state chuyển tiếp không layout jump.
- Expanded player lock interaction đúng và trả focus hợp lý khi đóng.
- Không còn warning aspect ratio hoặc above-the-fold LCP image.
- Transition không làm gián đoạn playback, lyrics scroll hoặc queue action.

**Verification:**

- `npm run test`
- Music E2E cho expand, close, navigate và player shutdown.
- Console desktop/mobile không warning.

**Dependencies:** Tasks 3 and 8

**Files likely touched:**

- `components/music/player-dock.tsx`
- `components/music/youtube-video-stage.tsx`
- `components/music/music-shell.tsx`
- `components/music/music-app.module.css`
- `tests/e2e/player-shutdown.spec.ts`

**Estimated scope:** Medium

### Task 10: Thêm recall choreography cho Memories

**Description:** Đồng bộ hero và chapter reveal theo shared tokens. Featured memory đổi bằng crossfade/mask; card reveal nhẹ theo batch và vẫn giữ grid dọc.

**Acceptance criteria:**

- Hero title, category rows và featured anchor vào theo một timeline.
- Hover/focus giữa Game và Place có image transition, không flash.
- Chapter heading và cards reveal khi vào viewport, không pin và không horizontal scroll.
- Empty Place chapter có static/reveal state đầy đủ.

**Verification:**

- E2E Game/Place focus và click-to-chapter.
- Screenshot populated Game và empty Place state.
- Reduced motion dùng `behavior: auto` cho chapter navigation.

**Dependencies:** Task 2

**Files likely touched:**

- `components/memories/memory-archive-page.tsx`
- `components/memories/memory-hero.tsx`
- `components/memories/memory-chapter.tsx`
- `components/memories/memory-fragment-card.tsx`
- `app/globals.css`

**Estimated scope:** Medium

### Task 11: Sửa Darkroom presence và outro Memories

**Description:** Đặt `AnimatePresence` đúng vị trí, thêm direction-aware image transition cho prev/next, hoàn thiện exit, focus và body scroll restore. Đồng bộ Epilogue với outro pattern.

**Acceptance criteria:**

- Modal open và close đều có animation; exit chạy thật khi `memory` về null.
- Prev/next/swipe dùng cùng direction language, không để ảnh cũ và mới chồng sai.
- Escape, keyboard arrow, touch và backdrop vẫn hoạt động.
- Body overflow và focus được khôi phục sau close.

**Verification:**

- E2E open, next, previous, swipe, escape và close.
- Test repeated open/close không leak listener.
- Reduced motion chuyển ảnh tức thì.

**Dependencies:** Task 10

**Files likely touched:**

- `components/memories/memory-darkroom-viewer.tsx`
- `components/memories/memory-epilogue.tsx`
- `app/globals.css`
- `tests/e2e/memories-motion.spec.ts`

**Estimated scope:** Medium

### Checkpoint C: Ba trang hoàn chỉnh

- [ ] Cả ba trang dùng cùng token và trigger rhythm.
- [ ] Music và Memories vertical-only ở mọi breakpoint.
- [ ] Portfolio horizontal-only ở desktop Selected Work.
- [ ] Player và Darkroom không leak listener, ticker hoặc body lock.

### Task 12: Performance, accessibility và cross-page polish

**Description:** Chạy browser trace, visual regression, responsive matrix và reduced-motion audit. Chỉ sửa bottleneck đo được; không thêm hiệu ứng mới ở vòng này.

**Acceptance criteria:**

- Không có console error hoặc warning trên ba route.
- LCP dưới 2.5s, CLS dưới 0.1, INP dưới 200ms trong môi trường test hợp lý.
- Không có long task trên 50ms do animation trong scripted scroll trace.
- Không có horizontal overflow ở 360-1920px.
- Focus order, heading hierarchy và contrast không regress.
- `prefers-reduced-motion` bỏ pin, scrub, parallax, ticker và route choreography.

**Verification:**

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- Browser performance trace và screenshot matrix cho ba route.
- `npm run build`

**Dependencies:** Tasks 3-11

**Files likely touched:**

- `tests/e2e/motion-system.spec.ts`
- `tests/e2e/music-motion.spec.ts`
- `tests/e2e/memories-motion.spec.ts`
- `tests/e2e/portfolio-navigation-scroll.spec.ts`
- Các file motion bị trace chỉ ra bottleneck, tối đa 1-2 file mỗi fix.

**Estimated scope:** Medium

## 8. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| ScrollTrigger pin sai sau font/image load | High | Tạo trigger theo thứ tự trang, `invalidateOnRefresh`, refresh sau asset thực sự thay đổi layout, không refresh mỗi frame |
| Route transition phá Portfolio scroll restoration | High | Định nghĩa một owner duy nhất cho restore, test direct load, SPA navigation, back và resize |
| Persistent player bị remount | High | Route boundary nằm bên trong provider; test playback liên tục qua ba route |
| Music ticker tiêu hao CPU khi offscreen | High | Gate bằng visibility + intersection; remove ticker trong cleanup |
| Contact hoặc section bị invisible khi GSAP lỗi | High | Progressive enhancement, DOM visible mặc định, animation set initial state trong context |
| `app/globals.css` lớn và nhiều rule legacy | Medium | Thay đổi theo từng section, không bulk rewrite; screenshot sau mỗi task |
| Memories có dữ liệu Place rỗng | Medium | Test cả empty state hiện tại và populated fixture trong E2E/component test |
| Test Portfolio hiện lỗi thời | High | Task 1 cập nhật test trước khi dùng suite làm quality gate |
| Animation đẹp trên desktop nhưng nặng trên mobile | High | Mobile giảm amplitude, bỏ pin/parallax, trace ở 390x844 và reduced-motion |

## 9. Definition of done

- Motion có cùng nhịp, ease và hierarchy trên ba trang nhưng không làm ba trang giống hệt nhau.
- Mọi animation trả lời được một trong bốn mục đích: hierarchy, storytelling, feedback hoặc state transition.
- Chỉ Portfolio desktop có horizontal storytelling.
- Native scroll vẫn phản hồi tức thì, không có global smoothing dependency.
- Không có duplicate ticker, listener, timeline hoặc pin spacer sau repeated navigation.
- Reduced motion và mobile có trải nghiệm đầy đủ, không chỉ là desktop bị tắt animation.
- Build, lint, typecheck, unit test, E2E và browser QA đều pass.

## 10. Assumptions cần giữ khi triển khai

- Không đổi route, navigation label, SEO metadata, dữ liệu hoặc chức năng player.
- Không redesign màu sắc và nội dung trong phase này.
- Mặc định bỏ custom cursor của Portfolio vì accessibility và performance; nếu muốn giữ, cần duyệt riêng như một exception.
- Không thêm dependency animation mới vì GSAP, ScrollTrigger, `@gsap/react` và Framer Motion đã đủ.

