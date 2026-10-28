# Mobile UX spec for a terminal-style AI chat

Scope: the ASCetic desktop skin for DeepSeek Harness Web (`src/skin.css`, `src/client.js`,
`src/pieces/chat.js`). Today it is a desktop product: the only two media queries are
`max-width: 1100px` and `max-width: 820px` ([skin.css](../../src/skin.css)), the status line is a
20px bar of 11px text, and popovers are fixed-position desktop menus. This document specifies
what changes below 1024px, with numbers and named patterns, so it can be implemented directly.

## Executive summary — the ten rules

1. **Touch floor is 44×44 CSS px** (iOS) and **48×48dp** (Material/Android); the absolute
   legal floor is **24×24 CSS px** (WCAG 2.2 AA) — nothing in this app may go below 24px even
   on desktop, and nothing interactive may stay below 44px below 768px.
2. **Never size the app with `100vh`.** Use `100dvh`, and on iOS additionally track
   `window.visualViewport`, because iOS Safari *always* overlays the keyboard and has no
   `interactive-widget` opt-out at all.
3. **The composer input must be ≥16px** or iOS Safari zooms the page on focus. This overrides
   the theme's 13px composer type.
4. **The 20px status line cannot survive on a phone.** Below 768px it becomes a 44px
   icon row that opens a bottom sheet of 44px monospace rows; at ≥1024px it stays as-is.
5. **The sidebar becomes an off-canvas drawer with a scrim** below 1024px, width
   `min(360px, 86vw)`, closed by scrim tap, Escape, and swipe.
6. **Popovers become bottom sheets** below 768px — max-width 640px, 72px top margin, 48px
   drag-handle hit region, tap-scrim to dismiss.
7. **Every `:hover` reveal must have a `@media (hover: none)` twin** that shows the control
   permanently; hover is not an affordance on a phone.
8. **Safe-area insets are mandatory**: `viewport-fit=cover` + `env(safe-area-inset-*)` on the
   composer, status line, drawer, sheets and toasts — 34pt of iPhone bottom inset otherwise
   eats your send button.
9. **One scroll authority per conversation**: `overflow-anchor` for the list, a 150px
   auto-scroll buffer, and a 44px "jump to latest" pill with an unseen-count badge.
10. **Audit, don't eyeball**: an automated pass asserts every rule in
    [Touch target audit rules](#touch-target-audit-rules) and fails the build on a regression.

## Hard numbers table

| Value | Source app / guideline | Why |
|---|---|---|
| 44×44 pt minimum hit region | [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) | "a button needs a hit region of at least 44x44 pt … to ensure that people can select it easily" |
| 44×44 pt default control size; 28×28 pt **minimum** control size (iOS/iPadOS) | [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Two different floors; 28pt is the "never below" value, not a target |
| 48×48 dp touch target (≈9 mm) | [Material 3 — Accessibility](https://m3.material.io/foundations/designing/structure) | "For most platforms, consider making touch targets at least 48 x 48dp … about 9mm" |
| 48 dp target even for nested icon buttons; do not apply density by default | [M3 — Icon buttons, accessibility](https://m3.material.io/components/icon-buttons/accessibility) | Density is what silently drops a 48dp target to 40dp |
| ≥8 dp gap between adjacent 48dp targets | [Android Accessibility — Touch target size](https://support.google.com/accessibility/android/answer/7101858) | "separated by 8 dp of space or more" — mis-tap prevention |
| 24×24 CSS px absolute floor (AA, with spacing exception) | [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | Legal/audit floor; the spacing exception is a 24px-diameter circle test |
| 44×44 CSS px (AAA) | [WCAG 2.1 SC 2.5.5](https://www.w3.org/WAI/WCAG21/Understanding/target-size) | The web-side equivalent of the HIG number |
| 16 dp screen margin at compact | [M3 — Breakpoints, compact](https://m3.material.io/foundations/layout/breakpoints/compact) | "Margins are 16dp from the leading and trailing edge" |
| 24 dp margins at medium and expanded | [M3 — Breakpoints, medium](https://m3.material.io/foundations/layout/breakpoints/medium) · [expanded](https://m3.material.io/foundations/layout/breakpoints/expanded) | Wider layouts get more margin, not wider text |
| 360 dp fixed pane default | [M3 — Breakpoints, expanded](https://m3.material.io/foundations/layout/breakpoints/expanded) | The canonical drawer/sidebar width token |
| Breakpoints: compact <600, medium 600–839, expanded 840–1199, large 1200–1599, XL ≥1600 dp | [M3 — Breakpoints](https://m3.material.io/foundations/layout/breakpoints) | The reference set our breakpoints must be mappable to |
| App bar 56 dp (mobile portrait), 48 dp (mobile landscape), 64 dp (tablet/desktop) | [Material — Structure](https://m1.material.io/layout/structure.html) | Compact header height; 112dp "medium" app bars are wrong on phones ([M3 spec](https://m3.material.io/components/app-bars/specs)) |
| Navigation bar 80 dp baseline → 64 dp in M3 Expressive | [Material Components — Bottom navigation](https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md) | Only relevant if a bottom nav is added; keep ≤64dp |
| iOS default text 17 pt; minimum 11 pt | [Apple HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | 17pt is the "body" reference; 11pt is the legibility floor |
| 4.5:1 contrast up to 17pt, 3:1 at 18pt+ | [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | The theme's 11px `--ax-ink3` tertiary text is the risk |
| Input font-size ≥16px | [CSS-Tricks — 16px or Larger Text Prevents iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom) · [Defensive CSS](https://defensivecss.dev/tip/input-zoom-safari) | At 15px or less iOS zooms the viewport on focus and never zooms back |
| `1rem` = 16px root default | [M3 — Type scale tokens](https://m3.material.io/styles/typography/type-scale-tokens) | Material's own sp→rem conversion pins 16px as the root |
| 80 characters max line length (40 for CJK) | [WCAG 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation) | Reading-width ceiling; our 79–111-column ASCII art already sits at this limit |
| Bubble max-width 60–75% of container; 85% on mobile | [AI UX — Anatomy of a Chat Interface](https://www.aiuxdesign.guide/guides/conversational-ui-guide/anatomy-of-a-chat-interface) | The 85% figure is the phone override |
| Composer starts 1 line, grows to ~5, then scrolls internally | [Ethora — Chat app UI/UX](https://ethora.com/blog/chat-app-ui-ux-design/) | Growth cap rationale; prevents a composer that eats the transcript |
| Auto-scroll buffer 150px (default) | [MUI X — Chat scrolling](https://mui.com/x/react-chat/behavior/scrolling) | Pause auto-scroll once the user is >150px from the bottom |
| Jump-to-latest appears whenever not at conversation end | [Grok release notes](https://grok.com/release-notes) | First-party statement of the affordance rule |
| Sheet medium detent ≈ **half** of the large (fully expanded) height | [Apple HIG — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) | A ratio, not a fixed px value — compute from the sheet's tall detent |
| Sheet drag handle: 22 dp padding top/bottom, 48 dp accessible hit target, 28 dp top radius | [M3 — Bottom sheets, specs](https://m3.material.io/components/bottom-sheets/specs) · [overview](https://m3.material.io/components/bottom-sheets/overview) | Handle geometry |
| Top 48 dp of a sheet is the interactive resize region | [M3 — Bottom sheets, accessibility](https://m3.material.io/components/bottom-sheets/accessibility) | The handle must be a real button target, not a 4px bar |
| Compact sheet: 72 dp top margin; >640dp window: 56 dp top **and** 56 dp side margins, max-width 640 dp | [M3 — Bottom sheets, specs](https://m3.material.io/components/bottom-sheets/specs) | "Sheet detachment" heights |
| Modal sheets are mobile-only; scrim tap dismisses; standard sheets have no scrim | [M3 — Bottom sheets, guidelines](https://m3.material.io/components/bottom-sheets/guidelines) | Desktop dialogs/popovers must not become modals on desktop |
| Minimum supported viewport 320 pt | [Claude — MCP Apps design guidelines](https://claude.com/docs/connectors/building/mcp-apps/design-guidelines) | "Design for variable widths, from a 320pt minimum up to tablet" |
| Safe-area bottom inset 34 pt (home indicator, all notched iPhones) | [Floow — Safe Area Inset](https://www.floow.design/blog/how-to-handle-safe-areas-and-the-dynamic-island) · [Kahler — "The 34 Pixels You Cannot Have"](https://blog.edwardkahler.com/blog/webkit-pwa-safe-area/) | The value `env(safe-area-inset-bottom)` resolves to |
| Safe-area top 59 pt (Dynamic Island), 47 pt (notch), 62 pt (iPhone 16 Pro) | [Floow — Safe Area Inset](https://www.floow.design/blog/how-to-handle-safe-areas-and-the-dynamic-island) | Why a hard-coded `padding-top` will be wrong on some device |
| MobileSafari reports `_obscuredInsets.bottom = 98px` | [WebKit bug 292603](https://bugs.webkit.org/show_bug.cgi?id=292603) | Concrete reason a 100vh layout overflows the visible page by ~98px |
| Chrome iOS mispositions `position:fixed; bottom:0` by ~44px until a tab switch | [Chromium issue 490150189](https://issues.chromium.org/issues/490150189) | Fixed bottom bars are unreliable in Chrome iOS; prefer a flex shell |
| `interactive-widget` ∈ `resizes-visual` (default), `resizes-content`, `overlays-content` | [MDN — viewport meta](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport) · [Chrome — viewport resize behavior](https://developer.chrome.com/blog/viewport-resize-behavior) | `resizes-content` is how Chromium shrinks the layout viewport for the keyboard |
| No iOS opt-out: the keyboard always overlays the page | [WebKit bug 259770](https://bugs.webkit.org/show_bug.cgi?id=259770) | `interactive-widget` cannot save you on iOS — VisualViewport JS is mandatory |
| `dvh` is derived from the **layout** viewport and ignores the keyboard | [Stack Overflow — keyboard shrink-to-fit](https://stackoverflow.com/questions/77812591/when-opening-the-keyboard-on-mobile-how-can-i-force-my-content-to-shrink-to-fit) · [Why CSS dvh ignores the mobile keyboard](https://dev.to/rl0425/why-css-dvh-ignores-the-mobile-keyboard-and-how-to-fix-it-31ao) | Explains why `100dvh` alone still fails under the keyboard |
| `svh`/`dvh`/`-webkit-fill-available` under-report height with `viewport-fit=cover` | [WebKit bug 254868](https://bugs.webkit.org/show_bug.cgi?id=254868) | Standalone/PWA height bug and its `100vh` workaround |
| Status line 20px tall, 11px type | [skin.css](../../src/skin.css) — `.ax-status` | The thing that must not be a tap target at 20px |
| Drawer / sheet max content width 640px | [M3 — Bottom sheets, specs](https://m3.material.io/components/bottom-sheets/specs) | Keeps a sheet from becoming a full-bleed desktop panel on a tablet |

Numbers marked **[heuristic]** below are design judgement, not sourced.

## Breakpoint + layout strategy

### Recommended set

```css
/* tokens the theme should own */
html[data-ascii] {
  --ax-bp-phone:  480px;   /* ≤480  : phone portrait            */
  --ax-bp-phablet: 767px;  /* 481–767: large phone / small window */
  --ax-bp-tablet: 1023px;  /* 768–1023: tablet portrait, split   */
  --ax-gutter: 16px;       /* M3 compact margin                  */
  --ax-gutter-wide: 24px;  /* M3 medium/expanded margin          */
  --ax-hit: 44px;          /* HIG                                */
  --ax-hit-android: 48px;  /* Material                           */
  --ax-status-h: 20px;         /* desktop bar, unchanged */
  --ax-status-h-touch: 44px;   /* ≤767px replacement     */
  --ax-sheet-max-w: 640px;
  --ax-drawer-w: min(360px, 86vw); /* 360dp fixed pane, clamped [heuristic] */
}
```

*Sourcing note: values marked **[heuristic]** are this spec's own design decisions, chosen to sit
inside the sourced bounds in the table above. Everything else is traced to a guideline.*

**Why 480 / 767 / 1023 and not Material's 600dp.** Material's compact bucket is `<600dp`
([breakpoints](https://m3.material.io/foundations/layout/breakpoints)), but a web app cannot rely on
dp: a resizable desktop browser window at 599px would get the "phone" layout for no good reason. The
chosen set splits on the device classes that change the *interaction model*: 480 ≈ the widest phone
portrait CSS viewport in circulation **[heuristic]**; 767 is the last width before a
phone-in-landscape or tablet-portrait width appears; 1023 is the last width before a persistent
sidebar can coexist with a readable 80-character column
([WCAG 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation)). The set is still
mappable to Material: `≤480` and `481–767` ⊂ *compact*, `768–1023` ⊂ *medium + expanded*,
`≥1024` ⊂ *expanded*.

| Range | Name | What changes |
|---|---|---|
| **≤480** | `phone` | Single pane. Drawer overlay at `var(--ax-drawer-w)` + scrim. Header **48px** — Material's *landscape* app-bar height, so it is a sanctioned bar height and costs three fewer lines of transcript than the 56dp portrait bar ([Material — Structure](https://m1.material.io/layout/structure.html)). Status line → 44px icon row. Composer bottom-docked, 16px input, no rounding. All popovers → bottom sheets. Bubble max-width 85%. |
| **481–767** | `phablet` | Same as `phone`, plus: composer may keep a second row for model/tool chips; status row shows up to 3 glyph segments; sheets may use the medium detent; gutter stays 16px (M3 compact margin). |
| **768–1023** | `tablet` | Drawer becomes *push* (in-flow, 320px **[heuristic]**) rather than overlay; status line returns to the real 20px monospace bar; popovers become popovers again (anchored, not sheets); gutter 24px (M3 medium/expanded); bubble max-width 75%; two-pane conversation + sidebar allowed. |
| **≥1024** | `desktop` | Status quo. Keep the existing 20px bar and 1100/820px `--ax-opt`/`--ax-opt2` collapse rules as-is. |

### The rule that matters more than width: short viewports

A phone in landscape is **wide and short** (e.g. 852×393 CSS px), so a pure width query puts it
in the tablet bucket and hands it a 20px status bar it has no room for. Add an escape hatch and
apply it to every rule above:

```css
@media (max-width: 1023px), (max-height: 500px) {
  /* compact chrome: 44px status row, drawer overlay, sheets */
}
```

Height-based compactness is why Material tracks compact **height** <480dp separately from compact
width ([Android window size classes](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes)).

### 1. Sidebar → off-canvas drawer with scrim

- Trigger: a 44×44 `menu` button in the compact header (ChatGPT uses a two-line menu icon to open
  the sidebar; on mobile the sidebar is "always in floating mode and auto closes when switching
  threads" — [OpenAI release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)).
- Panel: `position: fixed; inset-block: 0; inline-size: var(--ax-drawer-w);` slide from the
  inline-start edge; `transition: transform 200ms cubic-bezier(.2,0,0,1)`.
- Scrim: `position: fixed; inset: 0; background: color-mix(in srgb, #000 45%, transparent)`,
  **tappable** to dismiss, and the drawer's own background opaque (the terminal skin is
  see-through on macOS — see §2 of `skin.css`; that must not leak into mobile).
- Close on: scrim tap, Escape, drag past 40% width, and on route change to a thread.
- Focus: focus moves into the drawer, is trapped while open, and returns to the trigger on close.
- Drawer bottom padding: `calc(8px + env(safe-area-inset-bottom))` — the account row sits at the
  bottom, exactly where the home indicator is.
- Do **not** keep `min-width: 300px` style guards ([skin.css](../../src/skin.css) `.ax-menu`): on a
  320px viewport a 300px menu leaves 20px, which is the horizontal-scroll bug.

### 2. Header → compact

- Height **48px** on `phone` (below Material's 56dp portrait bar so the phone keeps a line of
  transcript), 56px at `phablet`.
- Contents: `menu` (44×44) · thread title (truncated, `text-overflow: ellipsis`, **not**
  `nowrap` on the container) · `new chat` (44×44) · `more` (44×44).
- The model picker moves **out of the composer and into the header** on mobile. That is what
  ChatGPT does: "On iOS and Android, you can find the picker at the top of the conversation. On
  web, it appears directly in the message composer."
  ([release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)).
- Header must apply `padding-top: env(safe-area-inset-top)` when `viewport-fit=cover`.

### 3. Status line → collapsible sheet or icon row

The vim-style bar is the theme's signature and its biggest mobile liability: 20px tall, 11px
type, `<button>` elements reset with `all: unset` (so their hit area is exactly their text).
Three states:

| Range | Status line treatment |
|---|---|
| ≥1024px | Unchanged: 20px bar, full segments. |
| 768–1023px | 20px bar, but `.ax-opt`/`.ax-opt2` collapse (current 1100/820 rules retire at this breakpoint). |
| ≤767px | **Collapsed row, 44px tall**, showing state glyph + mode + token bar + a `▴` affordance. The whole row is one 44px-tall button (`width:100%`). Tapping opens a **bottom sheet** (`max-height: 72vh` **[heuristic]**) containing the full data as monospace rows, each **44px** tall with a right-aligned value — an `htop` panel, not a menu. |

Implementation sketch:

```css
@media (max-width: 767px), (max-height: 500px) {
  .ax-status { height: var(--ax-status-h-touch); font-size: 12px; padding-inline: 12px; }
  .ax-status .ax-seg { min-height: var(--ax-hit); min-width: var(--ax-hit); }
  .ax-status .ax-seg.ax-opt,
  .ax-status .ax-seg.ax-opt2 { display: none; }
  .ax-status-sheet-row {
    display: flex; align-items: center; gap: 2ch;
    min-height: var(--ax-hit);
    padding-inline: 16px;
    font: 12px/1.4 var(--ax-mono);
  }
  .ax-status-sheet-row .ax-hint { margin-left: auto; color: var(--ax-ink3); }
}
```

Two hard constraints: (a) every interactive row is ≥44px; (b) the `▴`/`▾` glyph is decorative —
the *row* is the button, so the visual can stay 11–12px without violating the target rule.

### 4. Popovers → bottom sheets

Below 768px, every `[data-ascii-docked]` surface (the status-line menu, palette picker, density
picker, settings popover) renders as a sheet:

```css
@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] :is([role="dialog"], [role="menu"])[data-ascii-docked] {
    position: fixed;
    inset-inline: 0;
    inset-block: auto 0;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important; right: 0 !important;
    width: 100% !important;
    max-width: var(--ax-sheet-max-w);
    margin-inline: auto;
    max-height: 72vh;                 /* [heuristic] leaves header + one title line visible */
    overflow-y: auto;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    box-shadow: 0 -1px 0 0 var(--ax-line);   /* top rule, not a drop shadow */
  }
}
```

The theme sets `border-radius: 0 !important` on everything already, which correctly overrides
Material's 28dp sheet radius — keep that: a square sheet *is* the terminal idiom. What must not be
dropped is the **48dp drag handle region** at the top (M3: "the top 48dp portion … is interactive
when user-initiated resizing is available"), implemented as a full-width button with a 1-line
grabber, plus a scrim that dismisses on tap.

Detent guidance **[heuristic]**: two detents, `peek` = `min(340px, 46dvh)` and `full` = `min(72dvh, 640px)`.
Apple defines medium as "about half of the fully expanded height", so set `peek ≈ full / 2`
rather than hard-coding a number ([HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)).

## Touch target audit rules

The audit is a Playwright/CSSOM pass that runs on three viewports **[heuristic]** (360×640, 390×844, 852×393) and
fails on any violation. Assertions, in priority order:

**R1 — Universal floor (all viewports).** Every interactive element's `getBoundingClientRect()`
union of its `::before`/`::after` boxes is ≥ **24×24 CSS px**. Source: WCAG 2.2 SC 2.5.8. This is
the only rule that also applies to the desktop skin.

**R2 — Effective hit area below 768px.** Every interactive element must present ≥ **44×44 CSS px**
of *effective* area, counting padding and pseudo-element expansion:

```css
/* the canonical expansion technique the audit accepts */
.ax-hit { position: relative; }
.ax-hit::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: max(100%, var(--ax-hit));   /* 44px */
  height: max(100%, var(--ax-hit));
  translate: -50% -50%;
  background: none;
  pointer-events: auto;
}
```

`max()` is used rather than an `inset: calc(…%…)` hack because percentage insets resolve against
different axes and silently produce a lopsided box on non-square elements. With this form the
computed geometry is trivially checkable: `max(el.width, 44) x max(el.height, 44)`.

R2 therefore reduces to: for every interactive element, the union of its border box and its
pseudo-element boxes must satisfy `w >= 44 && h >= 44`. Buttons reset with `all: unset` report
text-only boxes and fail, which is the intent.

**R3 — Android floor.** When `navigator.userAgentData?.platform === "Android"` (or the viewport is
emulated at 412×915), the threshold rises to **48×48 CSS px**. Source: Material 3.

**R4 — Adjacent spacing.** For any two targets whose effective rects are within 24px **[heuristic]** horizontally
or vertically, the edge-to-edge gap must be ≥ **8 CSS px**. Source: Android accessibility guidance
("separated by 8 dp of space or more"). For pairs of targets under 24px, the audit instead applies
WCAG's spacing exception: a 24px-diameter circle centred on each bounding box must not intersect
another target or circle.

**R5 — Hit-testability.** For each target, `document.elementFromPoint(cx, cy)` must return the
target or one of its descendants. This catches the classic `overflow: hidden` status bar and any
control sitting under a fixed bar.

**R6 — No `all: unset` without restoration.** Static check: a rule containing `all: unset` on
`button` must be accompanied by `min-width`, `min-height` and `padding` in the same cascade for
the compact media query. `skin.css` currently resets every status-line, menu and settings button
this way.

**R7 — Safe-area exclusion.** No target's rect may intersect the top or bottom safe-area band.
Evaluate with `env(safe-area-inset-*)` resolved on a notched device profile.

**R8 — Contrast.** Text ≤17pt: **4.5:1**; ≥18pt or bold: **3:1** ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)).
The 11px `--ax-ink3` tertiary segments are the expected failures.

**R9 — Input type size.** Every `input`, `textarea`, `[contenteditable]` computed font-size must be
**≥16px** on touch viewports. Fail otherwise — it is the iOS zoom trigger.

**R10 — Hover parity.** For every rule matching `:hover` that reveals or moves a control, there
must be a corresponding `@media (hover: none)` or `@media (pointer: coarse)` rule making it
permanently visible. Static AST check over `skin.css`.

**R11 — No layout-forced horizontal scroll.** `document.scrollingElement.scrollWidth <=
innerWidth + 1` on every audit viewport, with all sheets open and a long code block rendered.

**R12 — Zoom allowed.** The viewport meta must **not** contain `user-scalable=no` or
`maximum-scale=1`; the audit fails if it does, because suppressing zoom to defeat the 16px rule is
the wrong fix ([Defensive CSS](https://defensivecss.dev/tip/input-zoom-safari),
[WCAG 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation)).

## Composer + keyboard

### Viewport meta (the prerequisite)

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
```

- `viewport-fit=cover` is required for `env(safe-area-inset-*)` to return non-zero
  ([WebKit — Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x)).
- `interactive-widget=resizes-content` makes Chromium resize the **layout** viewport, so `dvh`
  shrinks with the keyboard ([Chrome](https://developer.chrome.com/blog/viewport-resize-behavior), [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element)).
- It does **nothing on iOS**. WebKit's own bug states: "there remains no option to make the
  viewport resize to the actual visible region when a virtual keyboard is shown; The keyboard
  simply overlays the webpage with no option for opt-out"
  ([WebKit bug 259770](https://bugs.webkit.org/show_bug.cgi?id=259770)).
- If the host shell owns the `<meta>` and the plugin cannot patch it at load, skip straight to the
  JS path below — it is required on iOS regardless and is harmless where the meta already works.

### The shell height

```css
html[data-ascii] {
  --ax-app-h: 100vh;                  /* fallback */
  --ax-app-h: 100dvh;                 /* dynamic viewport */
  --ax-kb: 0px;                       /* written by JS */
  --ax-vvh: 100dvh;                   /* written by JS */
}
html[data-ascii] body {
  min-height: var(--ax-app-h);
  overscroll-behavior-y: none;
}
/* WebKit under-reports svh/dvh when viewport-fit=cover is set in installed apps */
@media all and (display-mode: standalone) {
  html[data-ascii] { --ax-app-h: 100vh; }
}
```

`dvh` alone is **not** sufficient: the CSS viewport spec treats the keyboard as an overlay that
does not resize the layout viewport, so the dynamic units track the URL bar, not the keyboard
([explainer](https://dev.to/rl0425/why-css-dvh-ignores-the-mobile-keyboard-and-how-to-fix-it-31ao),
[CSS Viewport Module L1](https://www.w3.org/TR/css-viewport-1/)).

### The VisualViewport bridge (mandatory on iOS)

```js
// one listener set, one rAF-batched writer
(() => {
  const vv = window.visualViewport;
  if (!vv) return;
  const root = document.documentElement;
  let raf = 0;
  const apply = () => {
    raf = 0;
    // iOS pans the visual viewport up, so offsetTop must be subtracted
    const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.setProperty('--ax-kb',  Math.round(kb) + 'px');
    root.style.setProperty('--ax-vvh', Math.round(vv.height) + 'px');
    root.toggleAttribute('data-ax-kb', kb > 120); // hysteresis: ignore the URL bar
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
  vv.addEventListener('resize', schedule, { passive: true });
  vv.addEventListener('scroll', schedule, { passive: true });
  apply();
})();
```

Notes that matter:

- `offsetTop` subtraction is the iOS-specific part; iOS *scrolls* the visual viewport, so
  `innerHeight - vv.height` alone over-reports the keyboard height
  ([WKWebView gotchas](https://takazudomodular.com/pj/zudo-tauri/docs/mobile/wkwebview-gotchas)).
- Everything is rAF-batched; do not write CSS variables directly in the listener.
- The 120px threshold is a **[heuristic]** hysteresis band so the URL-bar collapse doesn't toggle
  the keyboard layout.
- Expose `[data-ax-kb]` to CSS so the status row can hide itself while typing.

### Composer sizing

```css
@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] [data-composer-dock] {
    position: sticky;
    bottom: 0;
    z-index: 6;
    padding: 8px var(--ax-gutter)
             calc(8px + env(safe-area-inset-bottom, 0px));
    background: var(--ax-bg);
    border-top: 1px solid var(--ax-line);
    font-size: 12px;               /* the dock's stat row is not a control — 12px is fine */
    transform: translateY(0);
  }
  /* iOS: lift the dock by the keyboard height, because the layout viewport does not shrink */
  html[data-ascii][data-ax-kb] [data-composer-dock] {
    transform: translateY(calc(var(--ax-kb) * -1));
  }
  html[data-ascii] [data-composer-input] {
    font-size: 16px !important;     /* iOS zoom threshold — overrides the 13px skin type */
    line-height: 22px !important;
    min-height: 44px;               /* 22px line + 22px padding  */
    max-height: min(40dvh, 132px);  /* [heuristic] 5 lines: 5x22 + 22 padding */
    overflow-y: auto;
    -webkit-text-size-adjust: 100%;
  }
  html[data-ascii] [data-composer-dock] button {
    min-width: var(--ax-hit);
    min-height: var(--ax-hit);
  }
}
```

Why each number:

- **44px min-height** — one 16px line at 22px leading plus 22px of padding. It is also exactly the
  iOS minimum target height, so the collapsed composer doubles as a compliant control row.
- **`max-height: min(40dvh, 132px)`** — five lines (5 × 22px = 110px) plus 22px padding = 132px.
  Five lines is the conventional growth cap before the field scrolls internally
  ([Ethora](https://ethora.com/blog/chat-app-ui-ux-design/)); the `40dvh` half of the clamp is
  **[heuristic]** and stops a pasted essay from evicting the transcript.
- **`font-size: 16px !important`** — the skin currently sets
  `font: 13px/24px` on composer buttons and a 13px composer; at 13px iOS zooms on focus and never
  zooms back ([CSS-Tricks](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom)).
- **`-webkit-text-size-adjust: 100%`** — blocks Safari's landscape font inflation, which
  otherwise breaks the monospace column arithmetic the skin depends on.

### Behaviour

- `enterkeyhint="send"`, `autocapitalize="sentences"`, `inputmode="text"` on the input; a
  hardware/Bluetooth keyboard's Enter should insert a newline, the return key sends.
- **Do not autofocus the composer** on mobile, and **do not focus it when switching threads**.
  ChatGPT explicitly removed this: "We no longer focus the composer on mobile web when switching
  conversations" ([release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)).
  A keyboard flashing open over a thread the user is only reading is worse than one extra tap.
- Keep the transcript `overflow-anchor: auto` (the default) so streaming text above the viewport
  does not shift the line being read ([MDN scroll anchoring](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_anchoring/Overview)).
  Set `overflow-anchor: none` only on the streaming *last* message, if at all — never on `<body>`.
- Auto-scroll rule: if `distanceFromBottom <= 150`, keep pinned; else pause and show the pill
  ([MUI X](https://mui.com/x/react-chat/behavior/scrolling)).
- Streaming indicator: ChatGPT "shimmers" the composer input to show a response is streaming
  ([OpenAI Apps SDK UI guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines)).
  The terminal equivalent: a 1-cell block cursor blinking **once per second** at the end of the
  last message, plus the status row's `RUN` segment. Under
  `prefers-reduced-motion: reduce`, drop the blink and keep the static block.
- Send/stop state: the same 44×44 control swaps glyph `↵` → `■`; keep its position stable so a
  double-tap never hits the wrong action.

## Safe areas

`env(safe-area-inset-*)` resolves to `0` unless the viewport meta sets `viewport-fit=cover`
([WebKit](https://webkit.org/blog/7929/designing-websites-for-iphone-x)); values are then 34pt
bottom and 47–62pt top on current iPhones ([Floow](https://www.floow.design/blog/how-to-handle-safe-areas-and-the-dynamic-island)).

Exactly where each inset belongs:

| Surface | Property | Value |
|---|---|---|
| Compact header | `padding-top` | `env(safe-area-inset-top, 0px)` |
| Composer dock | `padding-bottom` | `calc(8px + env(safe-area-inset-bottom, 0px))` |
| Status row (44px mode) | `padding-bottom` | `env(safe-area-inset-bottom, 0px)` **only when it is the last element** — when the composer is docked above it, the composer owns the inset and the row takes `padding-bottom: 0` |
| Bottom sheet | `padding-bottom` | `calc(12px + env(safe-area-inset-bottom, 0px))` |
| Drawer | `padding-bottom` on the account row; `padding-left/right` in landscape | `env(safe-area-inset-bottom, 0px)`, `env(safe-area-inset-left/right, 0px)` |
| Toast / toast stack | `bottom` | `calc(env(safe-area-inset-bottom, 0px) + 56px)` (clears the composer; 56px is **[heuristic]**) |
| Full-bleed ASCII hero | `padding` | `max(16px, env(safe-area-inset-*))` — decorative art may bleed, text may not |

Rules:

1. **Never `padding: env(...)` on a scroll container** — it eats inside the scrollport. Use
   `scroll-padding-bottom: calc(env(safe-area-inset-bottom) + 8px)` on the transcript instead.
2. **Max, not sum.** Only one element on the bottom edge may consume
   `safe-area-inset-bottom`. If the composer and the status row are both visible, the composer owns
   it and the row is stacked above.
3. **Known WebKit gaps to design around** — the root scroll area can grow a blank, scrollable strip
   equal to the home-indicator inset even with `100dvh`/`-webkit-fill-available`
   ([bug 292603](https://bugs.webkit.org/show_bug.cgi?id=292603)), and in installed web apps
   `svh`/`dvh`/`visualViewport.height` report height *minus* safe area
   ([bug 254868](https://bugs.webkit.org/show_bug.cgi?id=254868)). Consequence: prefer
   `env()` padding + a `100vh` fallback over arithmetic in `calc(100dvh - 34px)`.
4. **Chrome iOS fixed bars are unreliable** — `position: fixed; bottom: 0` can be placed as if the
   toolbar were still visible, leaving ~44px of dead space
   ([Chromium 490150189](https://issues.chromium.org/issues/490150189)). A flex/`sticky` shell with
   the composer as the last flex child degrades better than `fixed` there.
5. **Landscape notch** — in landscape the inset moves to the sides; the drawer and any full-width
   sheet need `padding-inline: env(safe-area-inset-left) env(safe-area-inset-right)`.

## Motion + haptics + feedback

### Press states under `(hover: none)`

```css
@media (hover: none), (pointer: coarse) {
  /* kill hover-only reveals; show the action permanently */
  html[data-ascii] [data-message-actions] { opacity: 1; visibility: visible; }

  /* the hover highlight is meaningless without a cursor */
  .ax-seg:is(button):hover,
  .ax-menu-row:hover,
  .ax-hero:hover { background: none; opacity: 1; color: inherit; }

  /* press feedback: an inverted block, 0 delay — the terminal idiom */
  .ax-seg:is(button):active,
  .ax-menu-row:active,
  .ax-choice:active,
  [data-composer-dock] button:active,
  [data-message-actions] button:active {
    background: var(--ax-accent) !important;
    color: var(--ax-on-accent) !important;
    transition: none !important;
  }

  /* every target needs a press state — Apple: an unresponsive button "feels broken" */
  html[data-ascii] :is(button, [role="button"]) { transition-duration: 60ms; }

  /* remove the 300ms double-tap-to-zoom wait on controls */
  html[data-ascii] :is(button, [role="button"], [role="menuitem"], a) {
    touch-action: manipulation;
  }
}
```

Apple's guidance is explicit that a custom button must always have a press state, "Without a press
state, a button can feel unresponsive" ([HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)).
The inverse treatment fits the skin: on press, the segment flips to a solid accent block for the
duration of the touch — the same visual grammar as `.ax-mode`.

Timing: press-in is instant (`0ms`), press-out is `60ms` **[heuristic]**. Anything longer reads as
lag on a 120Hz screen; anything animated during press-in fights the finger.

### Hover parity for message actions

ChatGPT moved its quick actions out from behind a long-press to being "always visible below the
message" ([Feb 2025 release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)),
and keeps long-press on *the user's own* message for Copy/Edit
([Mar 2025](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)). Mirror that:

- Assistant message: a 44×44 action row **always visible** below the message (copy, retry, more).
- User message: **long-press (500ms)** opens a sheet with Copy / Edit; also expose the same actions
  through an always-visible `⋯` for users who cannot long-press.
- Long-press must not conflict with text selection: cancellation if the finger moves >10px
  **[heuristic]**, and never bind long-press on an element that contains selectable code blocks.

### Haptics

There is no haptic API for the mobile web on iOS Safari; Android exposes
`navigator.vibrate` **[heuristic]** — feature-detect and call it only on the "send" and "error"
transitions, never on scroll or streaming:

```js
const tap = () => { if (navigator.vibrate) navigator.vibrate(8); };
```

Treat haptics as a bonus: the press-state inversion above is the actual feedback channel, and it
works everywhere.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  html[data-ascii] .ax-hero,
  html[data-ascii] .ax-intro-crt { animation: none !important; }
  html[data-glyphs] [class*="_headline"] [class*="_titleGroup"] > span:first-child::after,
  .ax-blink { animation: none !important; opacity: 1; }
  [data-ascii] * { scroll-behavior: auto !important; }
  [data-ascii] .ax-status-sheet { transition: none !important; }
}
```

`prefers-reduced-motion: reduce` means "minimise non-essential movement", not "remove all
animation" ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)) —
keep opacity fades, remove the cursor blink, the CRT flicker, the hero pulse and smooth scrolling.
The existing reduced-motion block in `skin.css` only covers two animations and must be widened.

## Anti-patterns to avoid

Numbered against the current codebase, with the fix. Every one of these is a real line in
`skin.css` today.

1. **`100vh` in a fixed/absolute surface.** `.ax-menu.ax-pick { max-height: calc(100vh - ...) }`
   overflows by the URL bar and, on MobileSafari, by `_obscuredInsets.bottom = 98px`
   ([bug 292603](https://bugs.webkit.org/show_bug.cgi?id=292603)). → `100dvh` + `--ax-vvh`.
2. **`button { all: unset }` as the hit-area strategy.** `:where(.ax-status, .ax-menu,
   .ax-settings) :where(button) { all: unset }` leaves a 20px-tall, text-width target. → re-declare
   `min-width/min-height: var(--ax-hit)` plus a `::before` expansion.
3. **Hover-only affordances.** `.ax-hero:hover`, `.ax-seg:hover`, `.ax-menu-row:hover`,
   `.ax-choice:hover` all carry meaning that a finger can never discover. → `@media (hover: none)`
   parity, always-visible actions.
4. **Desktop-anchored popovers.** `[data-ascii-docked]` uses
   `left: clamp(4px, var(--ax-pop-x), calc(100vw - 360px))` and `.ax-menu { min-width: 300px }` —
   on a 320px viewport that is a 20px-wide leftover. → bottom sheet below 768px.
5. **11px status text as a tap target.** The bar is `font: 11px/20px`; text is fine, *targets* are
   not. → 44px rows in the sheet; 44px minimum on the collapsed row.
6. **`white-space: nowrap; overflow: hidden` on a control bar.** `.ax-status` uses both, which is
   correct for a 20px desktop bar and fatal on a phone where segments would silently disappear
   beyond the fold. → collapse to an icon row and move the detail into the sheet.
7. **`min-height: 100vh` / flex shells without a height.** The app must not rely on content height
   to place the composer; use a `height: var(--ax-app-h); display: flex; flex-direction: column`
   shell with the transcript as the only `flex: 1; min-height: 0` child.
8. **`min-width` forcing horizontal scroll.** `.ax-settings { grid-template-columns:
   max-content 1fr }` with 13px labels, `.ax-input { width: 14ch }`, and `.ax-menu { min-width:
   300px }` all push past 320px. → `grid-template-columns: minmax(0, 1fr) auto`, `width: auto;
   max-width: 100%`, sheets instead of menus.
9. **Tap-to-zoom suppression.** Do not "fix" the 16px rule with `user-scalable=no` /
   `maximum-scale=1`; that fails WCAG 1.4.8 and is detectable by the audit (R12).
10. **Fixed bottom bars in Chrome iOS.** `position: fixed; bottom: 0` is mispositioned by ~44px
    until a tab switch ([Chromium 490150189](https://issues.chromium.org/issues/490150189)). →
    flex shell + `sticky` composer.
11. **Autofocusing the composer on thread switch.** ChatGPT removed exactly this on mobile web
    ([release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)).
12. **`overflow-anchor: none` on the scroll container.** This is the usual cause of "the transcript
    jumps while streaming"; anchoring is on by default and should stay on for the message list
    ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-anchor)).
13. **A single scroll authority violation.** A page that scrolls *and* a message list that scrolls
    produces the iOS double-scroll rubber-band. Lock `<body>` (`overflow: hidden;
    overscroll-behavior: none`) and let the transcript own scrolling.
14. **Breakpoints that assume desktop.** Only `1100px` and `820px` exist, both of which hide
    *segments* rather than changing layout. A phone at 390px gets the desktop layout with two
    segments removed — no drawer, no 44px targets, no sheet.

## Sources

**Apple — Human Interface Guidelines**

- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) — 44×44pt hit region, press state, button size ramp (28/32/44/52/64pt)
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) — 44×44 default / 28×28 minimum control size, control spacing, contrast ratios
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) — 17pt default, 11pt minimum, Dynamic Type tables
- [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) — detents, medium ≈ half of large, grabber
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) — safe area definition

**Material Design 3 / Android**

- [Accessibility — designing](https://m3.material.io/foundations/designing/structure) — 48×48dp, 7–10mm, iOS 44pt note
- [Icon buttons — accessibility](https://m3.material.io/components/icon-buttons/accessibility) — 48dp even when nested; density warning
- [Bottom sheets — overview](https://m3.material.io/components/bottom-sheets/overview) — 28dp radius, 640dp max-width, 48dp handle
- [Bottom sheets — specs](https://m3.material.io/components/bottom-sheets/specs) — 22dp handle padding, 72dp/56dp margins, 640dp max width
- [Bottom sheets — accessibility](https://m3.material.io/components/bottom-sheets/accessibility) — top 48dp resize region, focusable handle
- [Bottom sheets — guidelines](https://m3.material.io/components/bottom-sheets/guidelines) — modal vs standard, scrim dismiss
- [Breakpoints](https://m3.material.io/foundations/layout/breakpoints) · [compact](https://m3.material.io/foundations/layout/breakpoints/compact) · [medium](https://m3.material.io/foundations/layout/breakpoints/medium) · [expanded](https://m3.material.io/foundations/layout/breakpoints/expanded)
- [App bars — specs](https://m3.material.io/components/app-bars/specs) — baseline medium 112dp
- [Material — Structure (M1)](https://m1.material.io/layout/structure.html) — app bar 56/48/64dp
- [Bottom navigation (M3 tokens)](https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md) — 80dp → 64dp
- [Type scale tokens](https://m3.material.io/styles/typography/type-scale-tokens) — 14 base, sp→rem, 16px root
- [Android — Touch target size](https://support.google.com/accessibility/android/answer/7101858) — 48dp, 8dp separation
- [Android — Window size classes](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes) — 600/840/1200/1600, compact height <480

**W3C / WCAG**

- [SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) — 24×24 CSS px + spacing exception
- [SC 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size) — 44×44 CSS px
- [SC 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation) — 80 characters / 40 CJK, no justification
- [CSS Viewport Module Level 1](https://www.w3.org/TR/css-viewport-1/) — `interactive-widget` normative behaviour

**Web platform**

- [MDN — `<meta name="viewport">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport) · [Using the viewport meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element)
- [Chrome — Prepare for viewport resize behavior changes](https://developer.chrome.com/blog/viewport-resize-behavior)
- [web.dev — The large, small, and dynamic viewport units](https://web.dev/blog/viewport-units)
- [MDN — `<length>` (svh/lvh/dvh definitions)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)
- [MDN — `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) · [CSS-Tricks — env()](https://css-tricks.com/almanac/functions/e/env)
- [WebKit — Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x)
- [WebKit bug 259770](https://bugs.webkit.org/show_bug.cgi?id=259770) — no iOS opt-out from keyboard overlay
- [WebKit bug 254868](https://bugs.webkit.org/show_bug.cgi?id=254868) — svh/dvh/`-webkit-fill-available` exclude safe area with `viewport-fit=cover`
- [WebKit bug 292603](https://bugs.webkit.org/show_bug.cgi?id=292603) — `_obscuredInsets.bottom = 98px`
- [Chromium issue 490150189](https://issues.chromium.org/issues/490150189) — `fixed; bottom:0` ~44px gap on Chrome iOS
- [MDN — VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) · [Chrome — Introducing visualViewport](https://developer.chrome.com/blog/visual-viewport-api)
- [MDN — Scroll anchoring overview](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_anchoring/Overview) · [`overflow-anchor`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-anchor)
- [MDN — `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) · [Using media queries for accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility) · [`pointer`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer)
- [CSS-Tricks — 16px or Larger Text Prevents iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom) · [Defensive CSS — Input zoom on iOS Safari](https://defensivecss.dev/tip/input-zoom-safari)
- [Why CSS dvh ignores the mobile keyboard](https://dev.to/rl0425/why-css-dvh-ignores-the-mobile-keyboard-and-how-to-fix-it-31ao) · [WKWebView gotchas on iOS](https://takazudomodular.com/pj/zudo-tauri/docs/mobile/wkwebview-gotchas)
- [Stack Overflow — keyboard shrink-to-fit / interactive-widget](https://stackoverflow.com/questions/77812591/when-opening-the-keyboard-on-mobile-how-can-i-force-my-content-to-shrink-to-fit)

**Product behaviour (first-party where possible)**

- [ChatGPT release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) — simplified mobile sidebar, model picker at top of conversation on mobile, long-press send to choose model, bottom-sheet Skills menu, always-visible message actions, long-press Copy/Edit, auto-scroll to latest, no composer focus on mobile-web thread switch, improved keyboard handling
- [ChatGPT iOS and Android app FAQ](https://help.openai.com/en/articles/7993487-chatgpt-ios-app-ipad-drag-drop) · [ChatGPT Android FAQ](https://help.openai.com/en/articles/8142208-chatgpt-android-app-faq) — sidebar menu icon, `•••` message action menu
- [OpenAI Apps SDK — UI guidelines](https://developers.openai.com/apps-sdk/concepts/ui-guidelines) — composer "shimmers" while streaming, composer always present
- [Claude — MCP Apps design guidelines](https://claude.com/docs/connectors/building/mcp-apps/design-guidelines) — 320pt minimum width, full-width mobile layouts, safe-area requirement for chat input + nav bar
- [Claude — Upload files](https://support.claude.com/en/articles/8241126-upload-files-to-claude) — `+` at the lower-left of the chat box
- [Claude — Use dictation on mobile](https://support.claude.com/en/articles/10065434-use-dictation-on-claude-mobile) · [Use voice mode](https://support.claude.com/en/articles/11101966-use-voice-mode) — microphone at the right of the input, waveform icon beside it
- [Design Critique: Claude Mobile App (IXD@Pratt)](https://ixd.prattsi.org/2026/02/design-critique-claude-mobile-app) — input cluster grouped at the bottom, keyboard occupying the bottom third
- [Grok release notes](https://grok.com/release-notes) — "Scroll to bottom button now shown whenever not at conversation end", mobile drawer/model-select z-index fixes
- [9to5Google — Gemini prompt bar gets sheet redesign](https://9to5google.com/2025/10/09/gemini-app-prompt-bar-redesign) — prompt bar becomes a bottom sheet that merges with the open keyboard; model picker moves to its bottom-right
- [AI UX Playground — composer comparison (ChatGPT/Claude/Perplexity/Gemini)](https://aiuxplayground.com/teardowns/compare/design-the-composer) — mode chips in the bar, `+` for attach, model nickname on the right rail
- [MUI X — Chat scrolling](https://mui.com/x/react-chat/behavior/scrolling) — 150px auto-scroll buffer, scroll-to-bottom affordance with unseen-count badge
- [AI UX Design Guide — Anatomy of a Chat Interface](https://www.aiuxdesign.guide/guides/conversational-ui-guide/anatomy-of-a-chat-interface) — 60–75% bubble max-width, 85% on mobile, 8–12px same-sender spacing
- [Ethora — Chat app UI/UX design](https://ethora.com/blog/chat-app-ui-ux-design/) — composer grows to ~5 lines then scrolls internally
- [Floow — Safe Area Inset: Notches and Dynamic Island](https://www.floow.design/blog/how-to-handle-safe-areas-and-the-dynamic-island) — 34pt bottom, 47/59/62pt top per device
- [Edward Kahler — The 34 Pixels You Cannot Have](https://blog.edwardkahler.com/blog/webkit-pwa-safe-area/) — 34px home-indicator zone in standalone mode

**Local source inspected**

- [skin.css](../../src/skin.css) — `.ax-status` (20px/11px), `all: unset` button reset, `.ax-menu` `min-width: 300px`, `[data-ascii-docked]` clamp, `max-height: calc(100vh …)`, 1100/820px media queries
- [client.js](../../src/client.js), [pieces/chat.js](../../src/pieces/chat.js) — composer dock and message surface selectors
