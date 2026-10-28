# ASCetic surface map — what has to change for touch and narrow viewports

Scope: every surface `dsh-theme-ascetic` creates or restyles, the numbers it is built with, and
the host hooks a mobile layer can stand on. This is the implementation map for the design spec in
[mobile-ux.md](./mobile-ux.md); that file argues *what* the phone experience should be, this one
says *where* each piece lives and *why it breaks*.

**Reference point.** Citations are against `HEAD` (`dc12ef2`): `src/client.js` = 903 lines,
`src/skin.css` = 890 lines. **The working tree is already ahead of this**: a teammate's in-flight
mobile layer has landed `src/mobile.css` and grown `client.js` to ~1125 lines — see §6 for the delta
and for the one claim in the brief that the host source contradicts.

**Measurement convention.** The skin is monospace throughout, so `1ch = 0.6em` (JetBrains Mono
advance). At 11px that is 6.6px; at 12px, 7.2px; at 13px, 7.8px. Every arithmetic line below states
its own inputs, so a different first available face shifts the result slightly, never the verdict.
Density tokens (`src/density.js:31-47`), which drive most heights:

| density | `--ax-row` | `--ax-nav` | `--ax-status-h` | `--ax-stack` | `--ax-pad` | `--ax-col` | `--ax-maxw` |
|---|---|---|---|---|---|---|---|
| cozy | 30px | 32px | **22px** | 10px | 12px | .70 | 960px |
| compact (default) | 26px | 26px | **20px** | 6px | 8px | .80 | 1040px |
| dense | 22px | 22px | **18px** | 3px | 6px | .88 | 1180px |

**Host source keys** (all read-only here; the hashed class names below are the real ones in the
installed build):

| key | path |
|---|---|
| `LAYOUT` | `@deepseek-ai/dsh-client-ui-layout/lib/client.js` |
| `SIDEBAR` | `@deepseek-ai/dsh-client-ui-sidebar/lib/client.js` |
| `CONV` | `@deepseek-ai/dsh-client-ui-conversation/lib/client.js` |
| `CHAT` | `@deepseek-ai/dsh-client-ui-chat/lib/client.js` |
| `TOOL` | `@deepseek-ai/dsh-client-ui-tool/lib/client.js` |
| `WORKSPACE` | `@deepseek-ai/dsh-client-ui-workspace/lib/client.js` |
| `SET-GEN` | `@deepseek-ai/dsh-client-ui-settings-general/lib/client.js` |
| `ACCOUNT` | `@deepseek-ai/dsh-client-ui-settings-account/lib/client.js` |
| `APPCSS` | `@deepseek-ai/dsh-web-frontend/dist/assets/index-BNyAYEM7.css` |

under `/Users/gnanesh/.bun/install/global/node_modules/`. Two things to know about those files:
`APPCSS` is one 77,470-byte line, so every rule in it is `APPCSS:1` and the *selector* is the
locator; and every UI plugin ships its CSS as a single template string at one line of its
`lib/client.js` (`SIDEBAR:115`, `CONV:17386`/`:18886`, `CHAT:2679`/`:4272`/`:6601`/`:7373`,
`TOOL:1528`, `WORKSPACE:1742`, `SET-GEN:60`, `ACCOUNT:1752`, `LAYOUT:73`), so those citations
name the line that holds the stylesheet plus the rule quoted from it. There is **no**
`@deepseek-ai/dsh-client-ui-primitives` in this install: menu/listbox/dialog/tooltip visuals and
the `DisclosureRow` row are primitive-owned and cannot be measured here — marked *(primitive,
unavailable)* below instead of guessed.

---

## 1. Surface inventory

| # | surface | where it lives | mounted how | current dimensions | desktop interaction | what breaks on touch / narrow | proposed mobile treatment |
|---|---|---|---|---|---|---|---|
| 1 | status line bar `.ax-status` | `skin.css:596-610`; component `client.js:559-586`; slot `shell.bottom` (`client.js:598-602`) | slot `shell.bottom` → rendered in the host's `[class*="_bottomRow"]` (`LAYOUT:73`: `grid-column:1/-1; overflow:auto; min-height:0`) | height `--ax-status-h` = 20px (22 cozy / 18 dense); `font:11px/20px`; `padding:0 12px` only on darwin (`skin.css:613`); `white-space:nowrap; overflow:hidden; user-select:none; z-index:5` | hover on segments, click opens popups, keyboard is *not* handled here (segments are plain buttons with `all:unset`) | min-content sum on a real session ≈570px after one turn / ≈710px while running, against a 390px viewport; `overflow:hidden` and no scroll path → 46–82% of the bar (clock, run count, toast) is clipped and unhittable | below 768px replace with a 44px summary row: one full-width button (state glyph + mode + token meter + `▴`), opening the `StatsSheet`; hide `.ax-opt`/`.ax-opt2` as today and move the detail into the sheet |
| 2 | gear segment `.ax-gear` | `skin.css:634-640`; `client.js:373-389`; opens `MORE_TRIGGER` (`client.js:367`) | button child of the bar; opens the sidebar's account menu by `.click()` on the host trigger (`openDocked`, `client.js:328-341`) | padding `0 5px`, `font-size: calc(20 × .9)=18px`, `line-height:1`, `overflow:hidden` → **≈21×20px** | hover inverts, click opens `[role=menu]`; `aria-haspopup="menu"` | 21×20 is far under 44×44; the glyph is a fallback-face character so its width varies by platform | 44×44 box in the touch row, keep the glyph 18px inside it |
| 3 | mode segment `.ax-mode` ("ASCII") | `skin.css:641-650`; `client.js:569-575` | button child of the bar, `data-ascii-menu-toggle` so the outside-press handler exempts it (`client.js:471`) | 5ch text + `padding:0 1ch` + 1px rule → **≈47×20px**; bold, letterspacing .08em | click toggles the quick menu; hover goes to label-primary fill | height 20px; 47px wide is okay but the whole bar row is a 20px touch strip, so adjacent segments are ~1px apart vertically from the screen edge | becomes the sheet trigger in the touch row (whole row is the button) |
| 4 | session seat: state segment (`.ax-state-run` / `.ax-idle`) | `skin.css:669-674`, `:660`, `client.js:403-409` (inside `StatusSession`, `client.js:392-449`) | child slot `ascii.status.session` declared at `client.js:601`, registered at `:606-607` | `○ IDLE` = 6ch+2ch padding = **≈53×20**; `RUN` variant = scan 8ch + `RUN` + `mm:ss` + `n tools` ≈ **198×20** | not interactive (span); the RUN variant is the only always-visible "working" signal | the widest and most truncated segment when it carries elapsed time and tool count | in the 44px row keep only the glyph + elapsed; full detail in the sheet |
| 5 | scan indicator `.ax-scan` inside RUN | `skin.css:675`; piece `SCAN` `client.js:242-264`; `usePiece` `client.js:124-137` | ascii.rest `mount()` into a `<span>`, 8 cols × 1 row, 16 fps | `width:8ch` = 52.8px, `font:inherit`, `white-space:pre` | animated only; `aria-hidden` | motion + 8ch of width for decoration; under `prefers-reduced-motion` the piece still mounts (the reduced-motion block `skin.css:887-890` does not touch it) | keep (it is the theme's tell) but 1 cell wide on touch, or freeze to `░▒▓█` |
| 6 | stat segments (activity / context / usage) | `client.js:412-440`; `StatButton` `client.js:355-364`; CSS `.ax-seg.ax-stat` inherits `skin.css:618-628` | buttons in the bar; each opens the *stock* dock pill's popup by querying `mainDock()` (`client.js:307-315`) and clicking it (`openStat`, `:348-352`) | all **20px tall**: activity ≈`12 turns 34 steps 42 tok/s` = 26ch+2ch ≈ **185×20**; context ≈`ctx ▕██████░░░░▏ 42% 21.5k/128k` = 31ch+2ch ≈ **218×20**; usage ≈**120×20** (`.ax-opt`, hidden ≤1100) | click opens a host `[role=dialog]` docked above the bar (`openDocked`); the host trigger stays hidden (`skin.css:514-516`) | 20px tall; the click target is a *proxy* for a `display:none` host button, which is a fragile contract (works via `HTMLElement.click()`), and the docked popup is positioned with `100vw`-based math (§3.6) | rows in the sheet; keep the compact token meter visible in the 44px row |
| 7 | token meter `.ax-bar` (inside context) | `skin.css:664-667`; `meter()` `client.js:107-111` | spans: `▕` + 10 cells + `▏` | 12ch ≈ 79px wide, colours by pressure (`.ax-hot` ≥70%, `.ax-full` ≥90%) | decorative | 12ch + percent + `21.5k/128k` is what pushes the bar past 200px per segment | keep the 10-cell meter, drop the absolute numbers below 480px |
| 8 | toast segment `.ax-toast` | `skin.css:676`; `notice` store `client.js:48-65`; rendered `client.js:577` | auto-removing span inside the bar after `notice.show()` (2.2s) | one line, 11px, width = message length (e.g. `hero: matrix-rain (random)` ≈ 27ch ≈ 178px) | appears in place, pushes the clock out | messages are *appended before the flexible fill*, so a toast displaces the right-hand segments out of the clipped area; no max-width, no wrap | render as a floating toast above the composer (safe-area aware), never inside the clipped row |
| 9 | run-count segment `.ax-run` | `skin.css:658`; `client.js:563`, `:579-581` | span; count from root-scoped `useSessions` (`useRunningCount`, `client.js:452-460`) | `● 3 running` = 11ch+2ch ≈ **86×20** | none | takes 86px from a 390px bar for a secondary fact | sheet row, or a single `●` badge |
| 10 | clock segment | `client.js:584` | span, right-aligned (`.ax-right`) | `HH:MM` = 5ch+2ch ≈ **46×20**; re-rendered by `useTick(15000)` (`client.js:564`) | none | first thing clipped when the bar overflows | keep, right-aligned, in the touch row |
| 11 | quick menu `.ax-menu` | `skin.css:688-718`; `QuickMenu` `client.js:496-513`; chrome from `Popup` `client.js:467-494`; mounted in slot `shell.overlay` (`client.js:603-604`) → host `[class*="_overlayLayer"]` (`LAYOUT:73`: `position:absolute; inset:0; z-index:20; pointer-events:none` + children auto) | React, portal-free: `position:fixed; left:4px; bottom:calc(status-h + 6px)`; `min-width:300px`; `white-space:pre` | 11 rows × 18px + title ≈ 228px tall, ≥300px wide; `font:12px/18px`; `padding:4px 0` | click rows to cycle values, arrow keys walk rows, Escape/outside-press/resize closes (`client.js:469-485`); focus moves to the checked row (`:479`) | rows are 18px tall; menu is 77% of a 390px viewport and 94% of a 320px one; no `max-width`/`max-height`; `left:4px` ignores which segment opened it; the resize closure fires when the keyboard opens (see §3.9) | bottom sheet: full-width columns on a scrim, 48px rows, drag-grip, `max-height:min(72dvh,640px)` |
| 12 | palette picker `.ax-menu.ax-pick` | `skin.css:741-746`, `:747-754`; `Picker` `client.js:528-545`; `PICKERS` `client.js:522-525` | same overlay slot; `left:auto; right:{menu.right}` set inline (`client.js:540`) | 19 options + 3 group headers + title ≈ 438px tall; row ≈282px wide (see §2 arithmetic); `max-height: calc(100vh - status - 16px)` | click sets the pref; `role="menuitemradio"` + `aria-checked`; arrow keys | `100vh` not `dvh`; right-aligned from `menu.right` computed once from `window.innerWidth` (`client.js:82`); needs `left:auto` → any content wider than `viewport - right` is clipped off the *left* edge with no scroll | sheet, `left:0;right:0`, rows 48px, swatches on their own line at ≤480px |
| 13 | density picker `.ax-pick` | same as 12 with `PICKERS.density` (`client.js:524`) | same | 3 options + title ≈ 100px tall, ≥ same width | same, with a `rows NNpx` hint | reachable only with the palette picker's geometry issues | same sheet |
| 14 | picker toggle segments `.ax-pick` buttons (pal/den) | `client.js:548-557`; `skin.css:629-632` (`.ax-right`) | buttons in the bar, `data-ascii-menu-toggle` | `pal paper` = 8ch + gap 1ch + padding 2ch + 1px ≈ **73×20**; density ≈ **72×20** | click toggles the picker, `aria-expanded` reflects state | hidden by `skin.css:655-657` at ≤820px, so on a phone there is **no way to reach either picker** except by cycling inside the quick menu | keep as sheet rows from the summary row, or re-show as 44px segments when the row has space |
| 15 | logo text input `.ax-input` (menu + settings) | `skin.css:721-738`; `LogoInput` `client.js:737-756`; two homes: `client.js:505` (menu) and `:765` (settings) | `<input>` with `all:unset`, `width:14ch`, `text-transform:uppercase`, `maxLength: LOGO_MAX` (12, `prefs.js:17`) | menu: 14ch = **100.8×18px** (`font:12px`, `line-height:16px` + 2px border); settings: 14ch = **109×22px** (`font:13px/20px`) | Enter blurs; typing writes `prefs.set` on every keystroke (`client.js:753`); `onBlur` re-syncs the draft | 12–13px input font → iOS Safari zooms the page on focus and does not zoom back; 18–22px tall | `font-size:16px`, `min-height:44px`, `width:min(100%, 20ch)` |
| 16 | settings row `.ax-settings` | `skin.css:767-785`; `SettingsRow` `client.js:758-773`; slot `settings.general.item` (`client.js:775-778`) → host section `SET-GEN:60` / `SET-GEN` `_section` rule `SET-GEN` item wrapper `.Pt1bsG_row{padding:16px 0}` | React in the host Settings **dialog** (`SET-GEN:60`: `.VOzbGW_panel{width:800px; max-width:calc(100vw - 48px)}`, `.VOzbGW_nav{width:188px}`, `.VOzbGW_options{padding:0 24px 24px}`) | `display:grid; grid-template-columns:max-content 1fr; gap:6px 16px; padding:10px 0; font:13px/20px`; 13 label/control pairs | click chips and toggles; `aria-pressed` / `role=switch` | on 390px the panel is 342px wide, minus the fixed 188px nav and 48px options padding → **106px** of content column, while the widest label (`chat stats row`, 14ch × 7.8 = 109px) is already wider → the grid cannot fit its first column; the 43 chips wrap to one per line | single-column grid (`minmax(0,1fr) auto`), labels above controls, 44px chips, and let the host nav collapse (host-owned, see §4) |
| 17 | settings choice chips `.ax-choice` | `skin.css:786-800`; `Choices` `client.js:711-719`, `Toggle` `client.js:721-730` | buttons in a wrapping flex row | `padding:0 .8ch`, 1px border, `font:13px/20px` → **≈53×22px** per chip (43 chips rendered) | click sets pref, `aria-pressed`; hover border lightens | 22px tall; one-per-line at 106px width; 43 of them makes a very long scroll | 44px min-height in a 2-column grid at ≤480px |
| 18 | New Session button (framed) | `skin.css:112-127` (host-button skin), `:162-187` (`[data-ascii-ns]` frame), `:188-196` (`.ax-ns` canvas); `installNewSessionArt` `client.js:793-870`; piece `pieces/new-session.js` | DOM injection: an aria-hidden `<canvas class="ax-ns">` appended into the host's own `button[class*="_newSession"]` (`client.js:797-803`); host button CSS `SIDEBAR:115` (`height:38px; padding:8px 12px; margin:0 2px 12px`) | width = sidebar 280 − 2×`--ax-pad` 8 − 2×2 margin = 260px → cols = ⌊260 / (12×.6=7.2)⌋ = 36; height = 3 rows × (7.2×2) = **43.2px** (cozy 13px font → 46.8px; **dense 11px → 39.6px**) | hover/focus: heavy frame + glint + running arrow, driven by `hot()` reading `:hover, :focus-visible` each frame (`client.js:804`, piece `new-session.js:36-57`) | 43.2px is 0.8px under the 44px floor and **39.6px at `dense`**; the hover/glint animation is unreachable by finger; skipped entirely on the collapsed rail (`client.js:840`, `:843`) which is what a phone shows by default | keep the frame as the drawer footer CTA at `min-height:44px` (`font-size:13px` floor), and give it a press state instead of the hover glint |
| 19 | hero art `.ax-hero` | `skin.css:571-588`; `HeroMark` `client.js:645-685`; slot `conversation.hero.brand.mark` (`client.js:693-694`) | ascii.rest piece in a `<pre>` (all arts) or `<canvas>` (the `chat` piece), `role="button"`, `tabIndex:0` | base `font:7px/1`; banner → `font-size: min(8px, calc(min(560px,64vw)/var(--ax-hero-cols,79)/.6))`; chat canvas `width:min(300px,70vw)` | click steps to the next art or redraws `random`; Enter/Space do the same (`client.js:679-683`); hover dims to .8 | banner on 390px: 64vw = 249.6 → font **3.75px** (6 rows → 22.5px tall) — unreadable; non-banner pieces are 53–65 cols (`ascii.rest` metas) × 7px × .6 = **223–273px** wide against a ~240–270px content box at ≤380px → clipped by `_frame{overflow:hidden}` | banner: `font-size:min(6px, 100vw/cols/.6)` and cap cols via `LOGO_MAX`; fixed-width pieces: select by available width and scale with a CSS `zoom`/`transform` or render to canvas; make the whole hero one ≥44px target |
| 20 | boot intro `.ax-intro` | `skin.css:821-885`; `playIntro` `intro.js:39-125`; `installIntro` `client.js:878-885` | plain DOM appended to `<body>` before React mounts (`intro.js:63`), `position:fixed; inset:0; z-index:2147483600` | full-screen; banner canvas `width:min(76vw, cols×6.85px)` (296px at 390); hint `bottom:28px; 11px; letter-spacing:.35em` | any key or pointerdown skips (`intro.js:88-97`); otherwise holds until the app reports ready, max 15s (`intro.js:22`, `:115`) | copy says **"press any key"** on a device with no keys; `preventDefault()` on the first pointerdown swallows the first scroll; the splash can hold the screen for up to 15s on a cold mobile load; no safe-area padding | on coarse pointers skip it (or play a 600ms version) and change the hint to `tap to skip`; respect `prefers-reduced-motion` as today |
| 21 | composer card `[data-composer-card]` | `skin.css:432-446`; host `CONV:18886` (`.uV2eYG_card`), rendered `CONV:19173` | CSS-only restyle of a host element: 1px border + `4px 4px 0` offset shadow + flat fill; `:focus-within` recolours the border | host card: `width:100%; max-width:calc(var(--dsh-chat-content-width) + 32px); padding-top:8px; gap:12px`; theme adds `--dsh-composer-stack-gap:4px` (`skin.css:444-446`, host default 6px `CONV:17386`) | typing, chips, `focus-within` border; the offset shadow is the only depth cue | `4px 4px 0` shadow sticks out past the card into a 16px side clearance; the 4px stack gap is under Android's 8px separation guidance; bubbles variant adds a `>` glyph at `left:14px` (`skin.css:464-473`) that is `position:absolute` inside `_grow` → collides with the first glyph at 16px input type | keep 1px border, drop the offset shadow at ≤767px, restore a 8px stack gap, move the `>` prompt into padding (`padding-left: calc(14px + 2ch)` already does this for the input) |
| 22 | send / stop word buttons | `skin.css:481-507`; host `CONV:18886` (`.uV2eYG_primary{width:34px;height:34px;border-radius:999px; transform:translateY(-2px)}`) | CSS-only: theme sets `width:auto; min-width:0; padding:0 1ch; font:13px/24px`, hides the icon and prints `send`/`stop` via `::after` (`:493-499`) | **≈47×34px** (`send` = 4ch × 7.8 = 31.2 + 2ch = 15.6); height stays the host's 34px | click sends / stops; hover inverts; `:disabled` dims to `--ax-ink3` | 34px tall (<44) and its neighbour controls are 28px (`+`, model select, context trigger); height is not under the theme's control until overridden; text swap `send`↔`stop` keeps width stable, but the 1ch padding makes it tight on 16px type | 44×44, glyph or word (pick one), `min-width:64px` if the word stays |
| 23 | composer accessory controls (`+`, model select, context trigger) | host only, untouched: `CONV:18886` `.uV2eYG_add{28×28}`, `.uV2eYG_select{height:28px}`, `CHAT:6798` `.Q51KRG_trigger{height:calc(28px + delta); padding:6px 8px}` (this is `STAT_TRIGGERS.context`, `client.js:304`) | host React | 28×28 / 28×N / 28×N | click | three 28px targets in a row that must not be mis-tapped; the theme hides the whole dock (`skin.css:508-516`) so their context triggers are `display:none` when the status line is on | 44px in the touch row; `@media (width<=480px)` already collapses the context trigger to 28×28 (`CHAT:6798`) — it needs the opposite on touch |
| 24 | running dots bubble | `skin.css:290-311`; host `CHAT:2679` (`.EvIC1a_runningContent`, `_runningDivider`, `_runningIcon`, `_runningText`), rendered from `CHAT:2679` region | CSS-only: hides the host's divider/icon/text and turns `_runningContent` into a bordered bubble with `::after` `···` animated by `ax-dots` | border 1px + `padding:0 1.5ch`, `line-height:22px` → **22px tall**, width 3ch of dots + 3ch padding | none (decorative) | animation is `step-end` clip-path; reduced motion already handled (`skin.css:888`) | keep, raise the line box to 24px on touch |
| 25 | chat bubbles `[data-chat-flow-kind]` | `skin.css:230-288`; host `CHAT:4272` (`.Sixlwa_bubble{padding:10px 16px; font-size:var(--dsh-content-font-size,14px); line-height:22px}`), `.Sixlwa_userStack{max-width:min(calc(var(--dsh-chat-content-width,748px)*.702),82%)}`, `.Sixlwa_userRow{align-items:flex-end}` | CSS-only restyle keyed on the flow attribute (`CHAT` sets `data-chat-flow-kind` on `.EvIC1a_flowItem`, `CHAT:2679` region) and on `data-ascii-chat` | `terminal`: 1px dashed border + `padding:3px 10px` (+`2ch` when glyphs) → ~28px tall; `bubbles`: 1px solid + `padding:2px 1ch`, user stack `max-width:min(75%,72ch)`, assistant node wrapped in a 8px-radius box with `padding:3px 1.5ch` and `width:fit-content` | text selection; the assistant bubble is `width:fit-content` so it hugs its content | bubbles inherit the 14px content type (fine) but the *column* they sit in is only ~270px at 390px (§4) so a 75% bubble is ~200px = ~25ch; `fit-content` + `max-width:100%` is fine, but bubbles-variant `.ax-round:8px` is the one rounding the global `border-radius:0` rule does not kill (`skin.css:262-265`) | keep the two styles; raise bubble max-width to 88% at ≤480px and let code blocks inside a bubble scroll |
| 26 | tool-call rows | `skin.css:409-411`; host `TOOL:1528` (`.o3BgMG_root[data-state]`, `.o3BgMG_bodyScroll{max-height:260px}`, `.o3BgMG_ioSection{padding:12px 16px}`), row shell from *(primitive, unavailable)* `DisclosureRow` | CSS-only: `[data-chat-flow-kind="tool-call"] [data-state]{min-height:0}`; `data-state` is on the tool root (`TOOL:1833`, `:2059`, `:2524`) inside the flow item | theme cancels the primitive row's min-height; the host's own header row is a 28–32px disclosure *(primitive, estimated from the 28px pattern used by `SET-GEN`/`ACCOUNT` rows — not measurable here)*; body scroll capped at 260px | hover reveals the inspect pill (`TOOL:1528` `.o3BgMG_inspectButton{opacity:0}` → 1 on `:hover`/`:focus-visible`); click expands | the inspect affordance is hover-only (the theme does not fix this); the 260px body cap is fine, but `ioSection`'s `grid-template-columns:max-content 1fr` with 16px padding leaves little for output text on a 270px column | 44px row target; add `@media (hover:none)` parity for the inspect pill |
| 27 | turn-process row | `skin.css:412-422`; host `CHAT:6601` (`.l_V-RG_root{height:calc(33px + delta); padding:0 0 8px; border-bottom:.5px}`), rendered `CHAT:6641` (`<button data-turn-process [data-open]>`) | CSS-only: theme adds `[+]`/`[-]` glyphs via `::before` when glyphs on, and `.02em` tracking | **33px tall**, full width | click toggles; chevron rotates | 33px tall; `[+]` insertion adds a pseudo-element to a *button*, so the accessible name still comes from the host text | 44px min-height; keep the glyph |
| 28 | markdown tables | `skin.css:372-390`; host `APPCSS:1` `._tableScroll_1ypvv_192{max-width:100%;overflow-x:auto;overscroll-behavior-x:contain}`, `.md-table-wide{overflow-x:hidden;padding-bottom:5px}` with `:hover,:focus-visible{overflow-x:scroll}`, `th,td{padding:10px 16px; min-width:100px; max-width:min(30vw,320px)}` | CSS-only: theme squares the grid (`border-collapse`, 1px borders, `padding:1px 1ch`, double `thead` rule) and strips `_tableScroll`'s own border/shadow | theme cell: `1px 1ch` padding → row ≈ `line-height 20px + 2 + 2` = 24px; host still enforces `min-width:100px` per column | nothing inside a table is clickable; the *scroller* is the interaction | **content loss on touch**: `.md-table-wide` is `overflow-x:hidden` and only `:hover`/`:focus-visible` reveals the scrollbar, which a finger never triggers → a 3+ column table is clipped with no way to scroll; theme's `min-width:100px` (host) keeps even `1`-char cells at 100px | override `.md-table-wide{overflow-x:auto}` unconditionally and `padding-bottom:0` in the touch layer; consider stacked label/value rows at ≤480px |
| 29 | markdown code blocks + copy button | `skin.css:393-405`; host `APPCSS:1` `._banner_7gxqk_24{padding:9px 14px}`, `._copyButton_7gxqk_62{padding:0; font:inherit}`, `pre{overflow-x:auto}`, `[data-code-wrap=false] pre{white-space:pre; overflow-wrap:normal}` | CSS-only: theme adds a 1px frame, kills the banner's `min-height` and sets `padding-block:1px` | theme banner ≈ **15px tall** (13px line + 2px), copy button ≈ **13px tall**; body scrolls horizontally (host) | copy button click; code horizontal scroll | the theme's banner compression turns the copy button into a ~13px target; 13px is also the `xs` token, so the banner text is small at arm's length | 44px banner, copy button ≥44×44 on touch, `touch-action:pan-x` on the `pre` |

---

## 2. Touch-target offenders

Two rules make almost every theme control a text-sized target:

* `:where(.ax-status, .ax-menu, .ax-settings) :where(button){ all: unset }` — `skin.css:614-617`.
* `all: unset` also on `.ax-choice` (`skin.css:788`) and `.ax-input` (`skin.css:722`).

`all: unset` removes `padding`, `border`, `min-width`, `min-height` and `line-height`, so each button
box collapses to its inline text box. Nothing in the CSS restores a 44px floor. **15 theme-owned
element types** and **8 host types the theme shrinks or leaves exposed** are therefore under
44×44 CSS px. Instance count with the settings panel open plus one picker: **≈87**.

### 2a. Theme-owned targets

| # | element | offending declaration (file:line) | computed box | why |
|---|---|---|---|---|
| 1 | `.ax-gear` | `skin.css:634-640` — `padding:0 5px; font-size:calc(var(--ax-status-h,20px) * .9); line-height:1; overflow:hidden` inside a 20px bar (`:600`) | 5 + 18×.6≈10.8 + 5 = **20.8 × 20** | bar height caps the box; 18px glyph in a 20px line |
| 2 | `.ax-mode` | `skin.css:641-646` + `.ax-seg{padding:0 1ch}` `:618-624` | 5ch(33) + 2ch(13.2) + 1px = **47.2 × 20** | height is the bar |
| 3 | `.ax-seg.ax-stat[data-ascii-stat="activity"]` | `.ax-seg` `:618-624` (`padding:0 1ch; gap:1ch`, no `min-height` anywhere) | text `12turns34steps42 tok/s` = 21ch(138.6) + 5 gaps(33) + 2ch padding(13.2) = **184.8 × 20** | height is the bar |
| 4 | `.ax-seg.ax-stat[data-ascii-stat="context"]` | same | text 28ch(184.8) + 3 gaps(19.8) + 2ch(13.2) = **217.8 × 20** | height is the bar |
| 5 | `.ax-seg.ax-stat.ax-opt[data-ascii-stat="usage"]` | same; hidden at ≤1100px by `skin.css:652-654` | text `tok↑12.5k↓3.2khit 42%` = 21ch(138.6) + 3 gaps(19.8) + 2ch(13.2) = **171.6 × 20** | height is the bar |
| 6 | `.ax-pick` toggle — palette | `.ax-seg.ax-right` `:629-632` + `padding:0 1ch` + `gap:1ch` | 8ch(52.8) + 1ch(6.6) + 2ch(13.2) + 1px = **73.6 × 20** | height is the bar |
| 7 | `.ax-pick` toggle — density | same | 3ch+5ch = 52.8 + 6.6 + 13.2 + 1 = **73.6 × 20** | height is the bar |
| 8 | `.ax-menu-row` (quick menu, 10 instances) | `.ax-menu{font:12px/18px}` `:698`; `.ax-menu-row{padding:0 1.5ch}` `:706-713` | text-line **18px tall**; width = `min-width:300px` (`:693`) → **300 × 18** | `padding:0` vertically ⇒ height = line-height |
| 9 | `.ax-menu-row` (palette picker, 19 / density, 3) | same + `.ax-pick .ax-menu-row{padding-right:1ch}` `:751` | 3ch(21.6) + 1ch(7.2) + 11ch(79.2) + 2ch(14.4) + hint 2×(68+6)=148 + 2.5ch(18) ≈ **288 × 18** | same 18px row |
| 10 | `.ax-input` (quick menu) | `.ax-input{width:14ch; padding:0 .8ch; border:1px}` `:721-732`; `.ax-menu-field .ax-input{line-height:16px}` `:737` | 14ch(100.8) × (**16 + 2 = 18**) | 12px font ⇒ 16px line + border |
| 11 | `.ax-choice` (settings, 43 instances) | `.ax-choice{all:unset; padding:0 .8ch; border:1px}` `:787-793`; parent `font:13px/20px` `:773` | 5ch(39) + 1.6ch(12.5) + 2 = **53.5 × 22** | 20px line + 2px border |
| 12 | `.ax-input` (settings row) | `:721-732` with parent `13px/20px` | 14ch(109.2) × **22** | as above at 13px |
| 13 | composer send/stop | theme `skin.css:481-489` over host `CONV:18886` `.uV2eYG_primary{width:34px;height:34px}` | `send`=4ch(31.2)+2ch(15.6)=46.8 × **34** (height untouched by the theme) | the word shrinks the width but not the 34px height |
| 14 | New Session frame `.ax-ns` | `skin.css:188-194` — `font-size:12px`, cell = .6em × 2 = 14.4px tall; 3 rows in `pieces/new-session.js:31` | 36 cols × 7.2 = 259.2 wide; 3×14.4 = **43.2 tall** (dense 11px → **39.6**) | 3-row frame at a 12px cell is 0.8px under 44 — and 4.4px under at `dense` |
| 15 | hero art button | `skin.css:571-586` + `:586` banner sizing | at 390px: font 3.75px × 6 rows = **249.5 × 22.5** | the width is fine, the height is a third of 44 |

### 2b. Host targets the theme compresses or leaves exposed

| # | element | offending declaration | computed box | note |
|---|---|---|---|---|
| 16 | sidebar session row | theme `skin.css:201-204` `height:var(--ax-row) !important` — 30/26/**22px** by density | **≥N × 22–30** | host default is 32px (`WORKSPACE:1742` `.YDXeBa_sessionRow{height:32px}`) — the theme *shrinks* it further |
| 17 | sidebar project row | same rule | 22–30px | host 34px (`WORKSPACE:1742`) |
| 18 | sidebar panel row | theme `skin.css:123-127` `height:var(--ax-nav)` | 22–32px | host `min-height:36px` (`SIDEBAR:115`) |
| 19 | sidebar collapse toggle | theme leaves host 28×28 (`SIDEBAR:115` `.hHd-Xa_iconButton{width:28px;height:28px}`), 36×36 when collapsed | **28 × 28** | the only way to open the sidebar on a phone (§4) |
| 20 | turn-process button | host `CHAT:6601` `height:calc(33px + delta)` | **N × 33** | theme adds only a glyph |
| 21 | code-block copy button | theme `skin.css:401-405` banner `min-height:0 !important; padding-block:1px` over host `APPCSS:1` `._banner_7gxqk_24{padding:9px 14px}` and `._copyButton_7gxqk_62{padding:0}` | **≈13 × 13** | theme's own compression creates this one |
| 22 | tool-row inspect pill | host `TOOL:1528` `.o3BgMG_inspectButton{padding:2px 8px; font-size:11px; line-height:16px; opacity:0}` + `opacity:0` until `:hover` | **≈20px tall, invisible** | hover-only ⇒ unreachable on touch; the theme does not twin it |
| 23 | composer accessories (`+`, model select, context trigger) | host `CONV:18886` 28×28 / `height:28px`; `CHAT:6798` `height:28px` | **28×28 / 28×N** | untouched by the theme, but they share the card with the theme's 34px send |

**Count: 23 numbered entries = 15 theme-owned types + 8 host types** (the six "host types" of the
brief's list collapse here to rows 16–23, counted as 8 because panel/session/project rows are
separate elements). Instances at rest / with surfaces open: status bar 7 · quick menu 11 · one
picker 22 · settings 44 · composer 1 · New Session 1 · hero 1 = **≈87**.

Distinct causes, in order of blast radius:

1. `all: unset` on buttons without a restored `min-width/min-height` → offenders 1–13.
2. The 20px bar as the *only* height source for its children → 1–7.
3. `padding:0 V` with `font:N/Mpx` ⇒ box height = line-height → 8–12 (18px and 22px rows).
4. Fixed row heights inherited from desktop density → 16–18.
5. Missing hover parity on host affordances → 22 (and the inspect pill, session-row `⋯`, message
   actions — the last is already `@media (hover:hover)`-gated by the host, `CHAT:6798` region
   `[data-actions-reveal=hover]`).

Fix shape (one rule, one place): in a touch media layer set
`min-height:var(--ax-hit); min-width:var(--ax-hit); box-sizing:border-box` on
`:where(.ax-status .ax-seg, .ax-menu-row, .ax-choice, .ax-input)` and re-derive the bar height from
`--ax-status-h-touch`, then add pseudo-element expansion (the pattern in
[mobile-ux.md §Touch target audit rules](./mobile-ux.md#touch-target-audit-rules)) only for
elements that must stay visually small (the gear, the scan segment).

---

## 3. Narrow-viewport hazards

Ordered by how much of the product they take away. Each entry names the declaration, the
arithmetic on a **390×844 CSS px** phone (iPhone 14 class) unless stated, and the fix.

### 3.1 — `.ax-status` clips 46–82% of its own content (most severe)

`skin.css:596-610`: `white-space: nowrap; overflow: hidden; user-select: none` inside a host row that
is itself `overflow: auto` (`.pI_x6G_bottomRow`, layout CSS at `layout/client.js:1`), and the comment
at 606-607 says the theme deliberately gives the host nothing to scroll.

Compact density, all widths in px (`ch` = 6.6 at 11px):

```
fixed: gear 20.8 + mode 47.2 + clock 46                        = 114.0
seat:  RUN = scan 8ch(52.8) + RUN 3ch(19.8) + mm:ss 5ch(33.0)  = 105.6 text + 3 gaps(19.8) + 2ch padding(13.2) = 138.6
       (with "3 tools": +7ch(46.2) + 1 gap(6.6)               = 191.4)
       IDLE = 6ch(39.6) + 2ch(13.2)                           =  52.8
activity 21ch(138.6) + 5 gaps(33.0) + 2ch(13.2)               = 184.8
context  28ch(184.8) + 3 gaps(19.8) + 2ch(13.2)               = 217.8
```

* fresh session, nothing projected yet: `114.0 + 52.8` = **166.8px** — fits.
* one turn in, context + stats known: `114.0 + 52.8 + 184.8 + 217.8` = **569.4px** → 179px (46%) clipped.
* running with one tool call: `114.0 + 191.4 + 184.8 + 217.8` = **708px** → 318px (82%) of a 390px bar
  is off-screen; without the tool count it is ≈650px.

The clipped tail holds the fill, the run-count segment, the clock and any toast. `overflow:hidden`
also removes them from hit-testing, so the clock and toast are not merely unseen — they cannot be
tapped, and there is no horizontal scroll path anywhere above them. Nothing in the theme reacts to
viewport width except the two `display:none` rules at `skin.css:652-657` (`.ax-opt` ≤1100,
`.ax-opt2` ≤820).

### 3.2 — the status line, its popovers and the composer all live at the bottom edge, where the keyboard is

`--dsh-composer-stack-gap` and the host both put the composer at the bottom of
`.pI_x6G_frame{grid-template-rows:minmax(0,1fr) auto}` (`LAYOUT:73`), and `shell.bottom` is the
last row. `.ax-menu` sits at `bottom: calc(var(--ax-status-h,20px) + 6px)` (`skin.css:691`) and
docked host popovers at `bottom: calc(var(--ax-status-h,20px) + 6px)` (`skin.css:521`). On iOS the
keyboard **overlays** the layout viewport with no opt-out (WebKit 259770, quoted in
[mobile-ux.md](./mobile-ux.md)): the bar, the composer's own controls and every popover anchored
above the bar end up behind the keyboard. Nothing here reads `visualViewport`, `dvh` or
`env(safe-area-inset-bottom)`; `100vh` is used as if it were visible height.

### 3.3 — `--dsh-chat-content-width: clamp(640px, …, 1040px)` — the floor, explained and *corrected*

`skin.css:216-219`:

```css
html[data-ascii] [data-conversation-content] {
  --dsh-chat-content-width: var(--dsh-chat-user-width,
    clamp(640px, calc(var(--dsh-conversation-column-width, 0px) * var(--ax-col, .8)), var(--ax-maxw, 1040px)));
}
```

Mechanics: `clamp(MIN, VAL, MAX)` never returns less than `MIN`, so **the preferred value is
irrelevant below 640px**. The host publishes `--dsh-conversation-column-width` from
`container.offsetWidth` on every resize (`CONV` `ConversationWidthControls`, `lib/client.js:17386`
region), so on a phone the preferred value is small:

```
390px viewport, sidebar collapsed to the 56px rail (LAYOUT:38 computeColumns(390, 280, 0, 56) → sidebar 56, centre 334)
preferred = 334 × .80 (compact --ax-col) = 267.2px
clamp(640, 267.2, 1040) = 640px        → 1.9× the centre column, 2.4× the 270px content box inside it
```

What that floor does and does not do on this host build — stated precisely, because the brief's
assumption ("content becomes 640px wide") is *not* what the shipped consumers do:

* **Does not overflow today**: every consumer wraps it in `max-width` on an element that also
  carries `width:100%` — `.EvIC1a_column{width:100%; max-width:var(--dsh-chat-content-width)}`
  (`CHAT:2679`), `.uV2eYG_card{width:100%; max-width:calc(var(--dsh-chat-content-width) + 32px)}`
  (`CONV:18886`), `.Sixlwa_userStack` (`CHAT:4272`), `dsh-client-ui-approval`/`-user-questions`
  `max-width`. A `max-width` above the container is inert.
* **Does break the geometry helpers**: `.wSkVaW_widthHandle{width:min(10px,
  calc((100% - var(--dsh-chat-content-width))/2 - 48px))}` and its `left/right:
  calc(50% + var(--dsh-chat-content-width)/2 + 24px)` (`CONV:17386`) evaluate to negative widths and
  off-screen offsets — the resize handles sit outside the viewport, which is why they cannot be
  grabbed on a phone (harmless, but accidental).
* **Collapses the table bleed**: `.hWmORq_body .md-table-wide` (`CHAT:6220`) computes
  `--dsh-table-spare: max(0px, (100cqw − 640)/2) = 0` and `--dsh-table-lead = 0 + min(640,100cqw) −
  100% = 0` at 100cqw = 270, so the host's designed full-bleed for wide tables disappears and the
  table is stuck inside `.md-table-wide{overflow-x:hidden}` (§3.5).
* **Removes the only correct host formula**: the host's *embedded* variant uses
  `--dsh-chat-content-width: min(calc(100% - 32px), 920px)` and
  `--dsh-composer-card-max-width: min(calc(100% - 16px), 952px)` (`CONV:17386`, `.wSkVaW_embeddedBody`).
  That is the mobile-safe shape; the theme's override replaces it with a floored clamp.
* **Latent**: any future rule that uses the variable as a *width* (the natural thing to write) paints
  640px inside a 334px column — 306px of horizontal overflow, clipped by
  `.pI_x6G_frame{overflow:hidden}` with no scroll.

Verdict: not the "most severe" bug it reads as — the host's own body variant is floored at **680px**
too (`clamp(680px, …, 920px)`, `CONV:17386`), so the theme is only 40px better than stock. Fix:
`--dsh-chat-content-width: min(calc(100% - 16px), var(--ax-maxw, 1040px))` at compact widths, and
drop the theme's override entirely (inherit the host's embedded formula) inside the mobile layer.

### 3.4 — `.ax-menu { min-width: 300px }` with `left: 4px` and no `max-width`

`skin.css:688-701`. 300 + 4 = 304px: 94% of a 320px viewport (the documented minimum supported
width), 78% of 390px. `white-space: pre` (`:699`) and `width:100%` rows (`:708`) mean **nothing ever
wraps or ellipsizes**, so a longer row grows the box past 300 and past the right edge; the frame is
`overflow:hidden`, so the overflow is unreachable, and `position:fixed` does not help because there
is no scroll container. The quick menu also has **no `max-height`** — only `.ax-pick` has one
(`:744`) — so on a 500px-tall landscape window it is 228px tall above a 20px bar: 248 of 500, which
fits, but with the keyboard up (visual viewport ≈300px) it does not.

### 3.5 — tables and code blocks are scrollable only by hover

`.md-table-wide` is `overflow-x:hidden` and only `:hover`/`:focus-visible` switches it to `scroll`
(`APPCSS:1`, `._tableScroll_1ypvv_192.md-table-wide`). On touch the hover never happens — Safari's
tap does not set `:hover` persistently enough for a scroll container — so wide tables are clipped:
host cell `min-width:100px` + theme `padding:1px 1ch` ⇒ **3 columns = ≥300px** against a **270px**
content column at 390px. Same class of bug for `[data-code-wrap=false] pre{white-space:pre}` — that
one is at least in an `overflow-x:auto` container (`APPCSS:1`), so it scrolls.

### 3.6 — `[data-ascii-docked]` popover: `left: clamp(4px, var(--ax-pop-x), calc(100vw - 360px))`

`skin.css:519-526`. The intent is "never let a ~360px popover go off the right edge". It is wrong in
three ways:

* At **390px** the clamp ceiling is `390 − 360 = 30px`, so the popover *always* starts within 30px of
  the left edge, regardless of the segment that opened it — the anchoring the feature exists for is
  lost on phones.
* At **320px** the ceiling is `−40px`; `clamp()` with `MIN > MAX` returns `MIN` (`4px`), so a
  360px-wide popover overflows 44px past the right edge with no scroll.
* There is **no `max-width`** on the docked popover, only the clamp on `left`; the popover's own
  width (`[role=dialog]`, primitive-owned) wins. The account menu is `min-width:124px;
  max-width:280px` in its signed-out form (`ACCOUNT:1752`), so the current worst case is 284px —
  under 390, over 320.
  `--ax-pop-x` is written once from `getBoundingClientRect().left` (`client.js:330`) and never
  updated on orientation change (`Popup` closes on `resize` instead, `client.js:477`).

### 3.7 — `.ax-pick { left: auto }` + `right: menu.right`

`skin.css:741-746` with `right` set inline from `menu.right` (`client.js:540`), which is
`Math.max(4, Math.round(window.innerWidth - segment.getBoundingClientRect().right))`
(`client.js:82`). `window.innerWidth` includes the classic scrollbar and ignores the visual viewport,
so the offset is computed against a width the user may not have. `left:auto` means the box grows
**leftwards**; with no `max-width`, a row wider than `innerWidth − right` extends past `x = 0` and
is clipped at the left edge with no scroll. Two-swatch rows (`auto`, `host` — `previewOf`,
`palettes.js:314-318`) are the widest: `2 × (4×11 + 24) + 6 gap = 148px` of swatch plus
`3ch` radio (21.6) + `1ch` gap + name (up to `tokyo-night`, 11ch = 79.2) + `2ch` hint padding
(14.4) + `2.5ch` row padding (18) ≈ **281.4px** — 88% of a 320px viewport, 72% of 390. It fits at
390 and barely at 320; adding one more swatch or a translated label breaks it. Also: the pickers are
**hidden at ≤820px** (`skin.css:655-657`), so this is a latent hazard that becomes live the moment
the pickers are re-shown on touch.

### 3.8 — `max-height: calc(100vh - var(--ax-status-h,20px) - 16px)`

`skin.css:744`. On iOS `100vh` is the *large* viewport, 60–100px taller than what is visible, so the
scrollport bottom is under the URL bar; with the keyboard up the whole lower half is behind it. The
list is 19 palette rows ≈ 438px, so it *does* need to scroll — and the last rows are exactly the
ones that go under the chrome. No `dvh`/`svh` fallback, no `env(safe-area-inset-bottom)`, no
`overscroll-behavior`.

### 3.9 — a `resize` listener closes the popup, and opening the keyboard fires it

`Popup` (`client.js:467-494`) does `window.addEventListener('resize', onClose)` at `:477/483`. On
Chromium Android (and on iOS when the URL bar collapses) focusing the logo `<input>` inside the quick
menu changes `window.innerHeight`, fires `resize`, and closes the menu — mid-edit, before the user
types a character, dropping focus. The 2.2s toast and the pref writes are unaffected, but the editing
session is lost. Same listener also closes a picker when the window is resized by the on-screen
keyboard's animation frames.

### 3.10 — hero typography collapses on a phone

`skin.css:586`: `font-size: min(8px, calc(min(560px, 64vw) / var(--ax-hero-cols, 79) / .6))`.

```
390px:  64vw = 249.6; DEEPSEEK banner 111 cols → 249.6 / 111 / .6 = 3.75px   (7 rows incl. shadow? 5+1=6 → 22.5px tall)
320px:  64vw = 204.8 → 3.07px
12-char logo (LOGO_MAX, prefs.js:17) → banner ~79 cols → 249.6/79/.6 = 5.27px
```

3–5px is below any legibility floor (11px is Apple's minimum). The non-banner pieces are worse in
width: `black-hole`/`eclipse`/`galaxy`/`planet` are 64 cols, `synthwave` 65 (`ascii.rest`
`dist/pieces/*.js` metas) at `font:7px/1` (`skin.css:573`) → **268.8–273px** wide with
`white-space:pre`, against a content box of ≈270px at 390px and ≈240px at 360px → clipped by
`_frame{overflow:hidden}` with no scroll. `.ax-hero[data-ascii-hero="chat"]{width:min(300px,70vw)}`
(`:588`) is the only piece that already fits.

### 3.11 — `.ax-newSession` art cells and the 44px floor

`skin.css:188-196` sets `font-size:12px` (13 cozy, **11 dense**) and the ascii.rest canvas draws
`cell = 2 × (font × .6)` tall (`ascii.rest/dist/mount.js`: `aspectRatio = cols / (rows * cell)`,
`h = w * cell`, `cell` default 2). Three rows ⇒ `3 × font × 1.2`:

```
12px → 43.2px   13px → 46.8px   11px (dense) → 39.6px
```

So the button that is supposed to be the mobile "new session" CTA is under the touch floor at the
default and 4.4px under at `dense`. Its width is `100%` of the host button, whose label is truncated
by the piece at `inner - arrow` cells (`pieces/new-session.js:29-30`), i.e. ≈29 chars at a 260px
sidebar; a drawer at `min(88vw, 280px)` keeps ~34 cols, fine. `installNewSessionArt` also **skips
the rail entirely** (`client.js:840`, `:843`) and the rail is what a phone shows by default.

### 3.12 — `.ax-swatch` sizes are frozen desktop pixels

`skin.css:756-763`: `.ax-swatches{gap:6px}`; `.ax-swatch{height:14px}`; `i{width:11px}`,
`i:last-child{width:24px}` → one palette strip = `4×11 + 24 = 68px`; two (`auto`, `host`) = 142px.
Nothing scales with type size, so at 12px they are 1.17em tall, and they are the reason the picker
row reaches 281px (§3.7). They are decorative, so a phone can drop to 3 cells (`bg · ink · accent`)
or move the strip onto its own line under the name.

### 3.13 — `.ax-settings` cannot fit the host's settings dialog on a phone

`skin.css:767-775`: `grid-template-columns:max-content 1fr; gap:6px 16px`.
Host dialog: `.VOzbGW_panel{width:800px; max-width:calc(100vw - 48px)}`, `.VOzbGW_nav{width:188px}`,
`.VOzbGW_options{padding:0 24px 24px}` (`SET-GEN:60`).

```
390px viewport → panel = min(800, 342) = 342
content column = 342 − 188 nav − 48 options padding = 106px
widest label "chat stats row" = 14ch × 7.8 = 109.2px  >  106px  → the max-content column alone overflows
```

`.VOzbGW_options` is `overflow-y:auto` only, so overflow-x computes to `auto` too: the theme's row
gains a horizontal scrollbar rather than wrapping, and the chips (53.5px each, §2 #11) fit one per
line in the 106px that is left. Functionally usable, visually broken. Note the 188px nav is a host
decision, not the theme's — the theme can only make its own row survive the 106px.

### 3.14 — smaller ones worth batching into the same pass

| hazard | declaration | effect |
|---|---|---|
| composer offset shadow | `skin.css:434` `box-shadow:4px 4px 0 0 var(--ax-drop)` | paints 4px outside the card inside a 16px side clearance; at ≤360px the shadow touches the screen edge |
| composer stack gap | `skin.css:444-446` `--dsh-composer-stack-gap:4px` (host 6px, `CONV:17386`) | under Android's 8dp separation guidance at the exact place where send sits next to the queue dock |
| `>` prompt | `skin.css:464-473` absolute at `left:14px; top:4px; line-height:24px` | at 16px input type the caret starts at 14px + 2ch while the glyph is positioned for 13px/24px — the prompt overlaps the first glyph |
| toast in the bar | `skin.css:676`, `client.js:577` | a 178px toast inserted before the flex fill displaces the clock out of the clipped area |
| intro hold | `intro.js:22` `READY_WAIT_MS = 15000` | a cold mobile load can sit on the splash for 15s; "press any key" copy is wrong on touch |
| no `touch-action` | anywhere in `skin.css` | 300ms double-tap delay on every control; the intro's `pointerdown` handler `preventDefault()`s (`intro.js:91`) |
| `caret-shape: block` | `skin.css:442` | unsupported in Safari, silently ignored (no breakage, just no block caret) |
| no safe-area handling | all bottom-anchored surfaces (`:521`, `:691`, `:744`) | 34px home-indicator band eats the status line / sheet buttons |
| `padding:0 12px` only on darwin | `skin.css:613` | in a mobile browser the gear starts flush at `x=0`, an edge mis-tap magnet |

---

## 4. Host component map

Whether the theme may edit a surface (CSS-only) or must mount into a slot depends on which of these
hooks it stands on. `[class*="_x"]` matches the CSS-module names (`hHd-Xa_x`, `pI_x6G_x`, …), so the
substring selectors the theme already uses keep working across host rebuilds — but they are broad:
`[class*="_root"]` alone matches every component whose map has a `root` key (sidebar, chat frame,
tool row, account menu, …). The theme narrows it with `:has(> [class*="_logoRow"])`
(`skin.css:95`), which is the only reliable sidebar discriminator.

### 4a. Layout and sidebar

| hook | real name / where | properties that matter | theme's current use |
|---|---|---|---|
| `[class*="_sidebarCol"]` | `pI_x6G_sidebarCol` (`LAYOUT:73`) | `background:var(--dsw-specific-sidebar-fill); border-right:.5px solid; min-width:0; overflow:hidden`; grid track width set inline on the frame (`LAYOUT:321`, `gridTemplateColumns: ${cols.sidebar}px minmax(...)`) | `skin.css:90-92` flattens its fill unless palette is `host` |
| `[class*="_root"]` (sidebar) | `hHd-Xa_root` (`SIDEBAR:115`) | `padding:6px var(--dsh-sidebar-inline-padding)` (12px); `font-size:14px`; collapsed `padding:18px 10px 6px` | `skin.css:95-127` normalises logo row, New Session, panel rows |
| `[class*="_logoRow"]` | `hHd-Xa_logoRow` (`SIDEBAR:115`) | `height:60px; margin-bottom:4px; padding:8px 0 8px 4px; justify-content:flex-end`; collapsed `height:36px` | `skin.css:95-111` (height auto, `data-ascii-no-brand` hides brand / row) |
| `[class*="_collapsed"]` | `hHd-Xa_collapsed` (`SIDEBAR:115`) | rail geometry: `padding:18px 10px 6px`, icon buttons 36×36, `newSession` 36×36, panel list `gap:12px` | used as a guard so art/rows only restyle when expanded (`client.js:840`, `:843`) |
| `[class*="_newSession"]` | `hHd-Xa_newSession` (`SIDEBAR:115`) | `height:38px; padding:8px 12px; margin:0 2px 12px; font-size:14px; overflow:hidden; container-type:inline-size`; collapsed 36×36 | button skin `skin.css:131-158`, frame `:162-187`, canvas `:188-196`, injection `client.js:793-870` |
| `[class*="_panelList"]` / `[class*="_panelRow"]` | `hHd-Xa_panelList` / `hHd-Xa_panelRow` (`SIDEBAR:115`) | list `gap:2px; margin-bottom:8px`; row `min-height:36px; padding:7px 8px; margin:0 2px` | `skin.css:119-127` sets `gap:0` and `height:var(--ax-nav)` |
| `[class*="_sessionRow"]` / `[class*="_projectRow"]` | `YDXeBa_sessionRow` (32px) / `YDXeBa_projectRow` (34px) (`WORKSPACE:1742`) | `padding:0 8px; gap:6px; border-radius`; row actions `display:none` → `inline-flex` on `:hover` | `skin.css:201-207` pins both to `--ax-row` |
| `[class*="_triggerRow"]` / `[class*="_settingsArea"]` | `VOzbGW_triggerRow` / `hHd-Xa_settingsArea` (`SET-GEN:60`, `SIDEBAR:115`) | trigger row `width:calc(100%+4px); margin:4px -2px`; account trigger `height:44px` (`ACCOUNT:1752`), collapsed 36×36 | `skin.css:680-685` hides both while the status line carries the gear |
| `[data-sidebar-collapsed]` | on `.pI_x6G_frame` (`LAYOUT:323`) | boolean attribute, no value (`|| void 0`) | **unused by the theme** — the right hook for a mobile drawer state |
| `[data-slot="…"]` | `settings.launcher`, `settings.general.item`, `sidebar.settings`, `sidebar.brand.mark`, `sidebar.brand.name`, `sidebar.toggle.badge`, `sidebar.workspaces`, `sidebar.footer.action`, `conversation.session.header.actions` | slot identity survives host rebuilds | theme mounts `settings.general.item` (`client.js:776-777`) and queries `settings.launcher` (`client.js:367`) |

### 4b. Conversation, chat, composer

| hook | real name / where | properties that matter | theme's current use |
|---|---|---|---|
| `[data-conversation-content]` | `.wSkVaW_body` (`CONV:17932` render; CSS `CONV:17386`) | container for `--dsh-chat-content-width`, `--dsh-composer-card-max-width`, `--dsh-composer-side-clearance:16px`, `--dsh-composer-dock-inset:8px`, `--dsh-composer-stack-gap` | `skin.css:216-219` overrides the width var (§3.3) |
| `[data-chat-flow-kind]` | on `.EvIC1a_flowItem` (`CHAT:2679` region) — values `user`, `assistant-step`, `steering`, `tool-call`, `turn-process`, `turn-trigger` | per-item attribute; theme keys bubble/row styling off it | `skin.css:230-311`, `:409-411` |
| `[data-chat-running]`, `[data-chat-following-tail]` | chat frame (`CHAT:2679`) | running flag / auto-scroll flag | dots bubble `skin.css:290-311` |
| `[data-composer-card]` | `.uV2eYG_card` (`CONV:19173` render; CSS `CONV:18886`) | `width:100%; max-width:calc(width+32px); padding-top:8px; gap:12px; font-size:var(--dsh-content-font-size,14px); line-height:calc(24px + delta)` | `skin.css:432-453`, `:456-507` |
| `[data-composer-dock]` | `.uV2eYG_dock` (`CONV:19346`; CSS `CONV:18886`) | `justify-content:center; gap:12px; padding-top:4px`; holds the stat pills + ContextMeter | hidden by `skin.css:514-516`, font pinned at 11px `:508-510` |
| `[data-composer-input]` | contenteditable div rendered by `ComposerContentEditable` (`CONV:18266`, `"data-composer-input"` at `CONV:18285`; CSS `CONV:18886`) | host `min-height:36px; padding:4px 8px 0 14px; white-space:pre-wrap; overflow-wrap:anywhere` | caret colour/shape `skin.css:440-443`; bubbles padding `:474-476` |
| `[data-input-scroll]` | `.uV2eYG_scroll` (`CONV:18328`) | `max-height:var(--dsh-composer-text-max-height)` = 336px (`CONV:17386`); `overflow-y:auto` | `>` prompt positioning `skin.css:464-473` |
| `[data-composer-stat]` | wrapper of each dock pill (`CHAT:7373` `StatsPills`: `anchor`/`pill`/`label`; pill `padding:1px 8px; font-size:12px; line-height:20px` → 22px tall) | theme's proxy targets: `activity`, `usage`, and `button[class*="_trigger"]` for context (`client.js:301-305`) | clicked from the bar (`client.js:328-352`) |
| `[data-turn-process]` (+`[data-open]`) | `CHAT:6641` button; CSS `CHAT:6601` `height:calc(33px + delta); padding:0 0 8px` | full-width disclosure row | glyph prepends `skin.css:415-422` |
| `[data-queue-dock]` | `_7yHdaG_dock` (`CONV:17011` render; CSS `CONV:17386` region) | `width:calc(100% - 2×clearance - 2×inset); max-width:calc(card-max - 2×inset)` | font pinned to mono `skin.css:542-544` |
| `[role="dialog"]`, `[role="menu"]`, `[role="listbox"]`, `[role="tooltip"]` | primitives *(unavailable in this install)*; the app bundle's only role rule is the darwin no-drag one (`APPCSS:1`) | portal into `<body>`; the theme marks the ones it moved with `data-ascii-docked` (`client.js:334`) | chrome override `skin.css:69-76`, docking `:519-526` |
| `[data-slot="conversation.session.header.actions"]` | host slot, rendered by `CONV` header (`.wSkVaW_header{min-height:76px; padding:10px 28px 0 20px}`, `CONV:17386`) | a place for one 44px control above the transcript | **unused by the theme** — natural home for a drawer button |

### 4c. Breakpoint / drawer affordances the host already has

Searched all installed UI bundles for width queries, `pointer`/`hover` features, `container`
queries, `drawer`, `collapsed`, `toggle`, `sidebarCol`:

| affordance | where | what it gives the theme |
|---|---|---|
| **no width media query in the shell** | `LAYOUT:73` (AppFrame CSS), `SIDEBAR:115` (sidebar CSS) contain only `prefers-reduced-motion` blocks | the layout cannot be re-flowed with CSS alone; every responsive decision is JS or the theme's own layer |
| JS auto-collapse | `LAYOUT:13` `SIDEBAR_AUTO_COLLAPSE = 1024`; `LAYOUT:237` `narrow = viewport < 1024`, `LAYOUT:238` `sidebarCollapsed = narrow ? !layoutInfo.narrowExpanded : sidebar === 0` | below 1024 the sidebar becomes the **56px rail** (`collapsedWidth = darwin||windows-titlebar ? 0 : 56`, `LAYOUT:38`/`:242`) — in flow, not overlaid |
| toggle action | `LAYOUT:417` `toggleSidebar`: below 1024 it flips `narrowExpanded`; `computeColumns(390, 280, 0, 56)` → sidebar 280, centre **110px** | expanding on a phone squeezes the conversation to 110px; there is no scrim, no overlay, no focus trap, no auto-close |
| toggle button | `SIDEBAR:364` (`aria-label` open/collapse), rendered `SIDEBAR:438` as the last child of the logo row on the web (`!darwinDesktop && toggle`); on darwin it is in `topStrip` (`SIDEBAR:396`) | **the only open/close affordance on narrow screens**, 28×28 (36×36 collapsed) |
| frame state attribute | `LAYOUT:323` `data-sidebar-collapsed` | CSS-visible truth for "is the rail closed", usable instead of guessing |
| container queries in the host | `CONV:18886` `@container (width<=560px)` (composer control gaps); `CHAT`, `agent-preset`, `deliverables`, `trajectory`, `permission-presets`, `plugin-inventory` similar | the composer already adapts to its own width — the theme can rely on that instead of viewport queries |
| a real 480px rule | `CHAT:6798` `@media (width<=480px){.Q51KRG_trigger{width:28px; justify-content:center; padding:6px} .Q51KRG_label{display:none}}` | the host *does* have one phone breakpoint, on the context trigger — the only one in the composer |
| coarse-pointer queries | `dsh-client-ui-attachment` (4×), `-deliverables` | precedent for `@media (pointer:coarse)` in a plugin |
| `@media (hover:hover)` guards | `CHAT:6798` region (`[data-actions-reveal=hover] .xzv4MW_actions{opacity:0}`), `WORKSPACE:1742`, `CONV` | message actions are already touch-safe; session-row `⋯`, tool inspect pill and the theme's own hovers are not |

**Does the host expose any way to open/close the sidebar on narrow screens?** It exposes exactly one:
the 28×28 (36×36 collapsed) `hHd-Xa_toggle` icon button inside the logo row, which flips
`narrowExpanded` and re-expands the sidebar **in the grid track** (`computeColumns` gives it 280px
and leaves the centre 110px on a 390px screen). There is **no drawer**: no `position:fixed`, no
scrim, no transform, no backdrop, no focus trap, no Escape handler, no close-on-navigate, and no CSS
hook for any of it — and the frame is `overflow:hidden`, so an off-canvas panel would be clipped
rather than sliding. Therefore **the theme must implement its own drawer** (panel + scrim + Escape +
focus return) if it wants one; the only things the host will do for it are (a) render a toggle, and
(b) tell it, via `data-sidebar-collapsed`, that the rail is closed.

One caveat, because it changes what "implement its own" means: a third-party plugin,
`dsh-web-mobile` v3.2.1, **is installed in this profile**
(`/Users/gnanesh/.dsh/profiles/web/node_modules/dsh-web-mobile`) and it *does* convert the host
sidebar into an off-canvas drawer (`translateX(-110%)`, scrim at z-index 1299, sidebar pinned at
1300, `@media (max-width:1023px) and (pointer:coarse)`, per `src/client/styles/layout.css.ts:95-240`)
and marks the DOM with `data-mobile-nav="frame|toggle|files|session-log"` (48 occurrences in
`src/client/`). Those markers exist **nowhere** in the host packages. Any theme rule keyed on
`[data-mobile-nav]` therefore silently depends on that plugin being installed — see §6.

---

## 5. Implementation seams

### 5.1 React/JS seams in `src/client.js` (line numbers at `HEAD`)

| seam | lines | why it is the right hook |
|---|---|---|
| `usePrefs()` | 43-45 | one `useSyncExternalStore` over `prefs.get/subscribe`; every component that must react to a new pref already calls it |
| `notice` store | 48-65 | single-line toast; on touch it needs a floating surface (bar is clipped, §3.1) — change the presenter, not the store |
| `menu` store | 71-90 | holds `open` **and** `right`; `menu.right` is computed from `window.innerWidth` at `:82` — the one desktop assumption in the popup plumbing. A sheet mode needs `open` only; an anchored mode needs an anchor element, not a pixel offset |
| `applyDocument` / `clearDocument` | 172-198 | the only place that owns `documentElement.dataset` lifecycle, incl. the `ascii*` attributes and `--ax-pop-x`; a `data-ascii-mobile` / `data-ascii-touch` / `data-ascii-kb` switch belongs here so unload stays exhaustive (`clearDocument` enumerates the key list at `:194`) |
| `installSkin` | 200-234 | creates the single `<style data-plugin>` tag and appends `${SKIN_CSS}\n${DENSITY_CSS}` (`:205`); **a mobile stylesheet is appended here** |
| `Popup` | 467-494 | owns Escape, outside-press, `resize`-close, row focus and arrow-key roving. Sheet behaviour (scrim, focus trap, `visualViewport` resize tolerance) is a change to this component, not a new one |
| `QuickMenu` / `Picker` | 496-513 / 528-545 | row markup is shared (`.ax-menu-row`); sheet rows only need the class + gate, so one CSS layer can resize both |
| `PickButton` | 548-557 | `.ax-opt2` ⇒ hidden ≤820 (`skin.css:655-657`); re-showing or moving the pickers is decided here |
| `StatusLine` | 559-586 | composes every bar segment; the 44px summary row and the "which segments survive" decision live here |
| `StatusSession` | 392-449 | the seat's data (running, tools, ctx, tokens, stats); a sheet can re-render the same data without the bar |
| `MenuOverlay` | 589-596 | picks `QuickMenu` vs `Picker`; a third branch (`StatsSheet`) drops in here — it already runs inside `shell.overlay` |
| `HeroMark` | 645-685 | hero kind + click cycle; narrow-width art selection/scaling belongs here |
| `SettingsRow` / `Choices` / `Toggle` / `LogoInput` | 758-773 / 711-719 / 721-730 / 737-756 | the settings grid that must become one column; `LogoInput` is the 16px-zoom offender |
| `installNewSessionArt` | 793-870 | cell-size/render decision and the rail guard (`:840`, `:843`); 44px height is a `font-size` choice here |
| `installIntro` | 878-885 | already gates on `prefers-reduced-motion` (`:881`); add a coarse-pointer gate (or shorten) here, next to it |
| `apply()` step list | 889-900 | registration order; a `installViewport`/`installMobile` step goes in this array (before `registerStatusLine` if the bar reads the flag on first render) |
| `inject` | 903 | `['theme','slots']` only — no new host service needed for a CSS+DOM mobile layer |

Two host slots the theme does **not** use yet and should consider: `shell.leading`
(mounted only when `darwin && sidebarCollapsed`, `LAYOUT:315` — unusable on mobile web) and
`conversation.session.header.actions` (always rendered, `CONV` header) — the latter is the correct
home for a 44px drawer button if the theme ships its own drawer.

### 5.2 CSS file layout

`scripts/build.mjs:25` sets `loader: { '.css': 'text' }` for **every** `.css` import, and
`client.js:36` already does `import SKIN_CSS from './skin.css'`. So a sibling `src/mobile.css` needs
**no build change**: import it next to the other two imports and append it in `installSkin` after
`DENSITY_CSS`:

```js
import SKIN_CSS from './skin.css'
import MOBILE_CSS from './mobile.css'
...
tag.textContent = `${SKIN_CSS}\n${DENSITY_CSS}\n${MOBILE_CSS}`
```

Order matters, and this is the one non-obvious constraint: `DENSITY_CSS` emits
`html[data-ascii][data-ascii-density="id"] body { … }` (`density.js:94`), i.e. specificity (0,2,2)
targeting `body`. Any mobile rule that must *override a density variable* has to match that —
`html[data-ascii][data-ascii-mobile] body` is also (0,2,2), so it only wins **because it comes later
in the same sheet**. Keep mobile.css last, and prefer overriding on the consumer
(`.ax-status { --ax-status-h: … }`) where possible so the density/compact fight never starts.
The same applies to `--dsh-chat-content-width`, declared on `[data-conversation-content]`
(`skin.css:216-219`) — a mobile override needs the same `html[data-ascii]` prefix or it loses.

Recommendation: keep it *one* stylesheet (`skin.css` desktop, `mobile.css` touch/compact) rather
than growing `skin.css`; do not split per-surface files (three small files would each need the same
specificity bookkeeping and the unload path in `installSkin` stays trivial).

### 5.3 Prefs and attributes — the minimal set

`src/prefs.js` plumbing, in the order a new field must be touched:

1. `DEFAULTS` (`:19-31`) — add the field with its default.
2. `sanitize()` (`:33-48`) — **enumerates every field explicitly**; a field missing here is silently
   dropped on load and on every `set()`.
3. `KEY`/`SCHEMA` (`:9-11`) — bump `SCHEMA` only if an *existing* default changes; `load()` (`:65-71`)
   uses the schema to re-apply `DEFAULTS.palette` once.
4. `prefs.set` (`:82-91`) — writes `{schema, …state}`; nothing else needed.
5. `watchStorage` (`:98-106`) — already generic.

Minimal additions for mobile:

| addition | kind | purpose |
|---|---|---|
| `mobile: 'auto' \| 'on' \| 'off'` (default `'auto'`) | pref | `auto` = follow `(max-width:1023px)` **or** `(pointer:coarse)`; `on/off` for the user who wants the desktop bar in a narrow window, or the touch layout on a tablet |
| `data-ascii-mobile` | html attribute | set by `applyDocument`; gates the layout layer. Useful as a *class-like* hook in selectors so specificity stays simple |
| `data-ascii-touch` | html attribute | pointer:coarse only — sizes without re-layout (a 1024px tablet keeps the desktop layout with 44px targets) |
| `data-ascii-kb` | html attribute | keyboard-open flag, with hysteresis (≥120px) so the URL bar collapsing does not toggle it |
| `--ax-kb` | root style property | keyboard height in px, written from `visualViewport` (`innerHeight − vv.height − vv.offsetTop`), rAF-batched |
| `--ax-hit`, `--ax-status-h-touch`, `--ax-sheet-*` | root custom properties | one place for the numbers |

Breakpoint recommendation: **use the host's own 1024** for layout (`(max-width:1023px)`, matching
`SIDEBAR_AUTO_COLLAPSE = 1024`, `LAYOUT:13`) and **767/480** inside it, and gate pointer-dependent
sizing on `(pointer:coarse)`. Do not invent a 768 breakpoint that disagrees with the host's 1024
rail threshold — the sidebar state changes at 1024, so a layout that changes at 768 will spend
256px of width in a state nobody designed.

---

## 6. Delta: what has already landed in the working tree, and where it disagrees with this map

While this map was being written, the working tree gained an in-flight mobile layer. Recorded here
so the Lead can reconcile the two without re-reading the diff:

| landed | where | covers |
|---|---|---|
| `src/mobile.css` (~15 KB, 12 sections) | new file | tokens (`--ax-hit:44px`, `--ax-sheet-h:min(72dvh,640px)`), coarse-pointer sizing for `.ax-seg/.ax-menu-row/.ax-choice`, 44px compact status row, popovers → bottom sheets, docked host popovers → sheets, sidebar drawer rules, header/tabs, composer 16px + `dvh` caps, conversation, settings, intro, reduced motion |
| `installViewport(ctx)` | `src/client.js` (new §3b) | `visualViewport` `--ax-kb` + `data-ascii-kb` bridge with 120px hysteresis, rAF-batched, disposed |
| `SheetGrip`, `SummarySeg`, `StatsSheet` | `src/client.js` | sheet chrome, the 44px summary segment, the stats sheet body |
| `Popup` gained a `title` prop | `src/client.js` | sheet header |
| `package.json`, `lib/client.js` | modified | version bump + rebuilt bundle |

Points where the in-flight layer and this map disagree, worth a look before more work lands:

1. **`[data-mobile-nav="frame|toggle|files|session-log"]`** (mobile.css §6-7) is **not a host
   attribute** — it is emitted by the third-party `dsh-web-mobile` plugin installed in this profile
   (48 occurrences in its `src/client/`), and does not exist in any `@deepseek-ai` package. The
   comment "the host already slides the sidebar off-canvas below 1024px…" is accurate only when that
   plugin is installed; without it the host only collapses to the 56px rail (§4c) and those rules are
   inert — no scrim, no drawer, and `[data-mobile-nav="toggle"]` finds nothing to enlarge. Either
   declare the dependency, or key the drawer on host facts (`[data-sidebar-collapsed]`, the
   `hHd-Xa_toggle` button) and own the drawer.
2. **The chat-content-width floor** (§3.3) is not fixed by the layer: `skin.css:216-219` is untouched,
   so the `clamp(640px, …)` floor still applies at every width. The fix belongs in the mobile layer
   as `min(calc(100% - 16px), var(--ax-maxw))`, per §3.3.
3. **`.ax-status` clipping** (§3.1) is addressed structurally by the 44px summary row, but the
   desktop bar between 768–1023px still has `white-space:nowrap; overflow:hidden` and no width
   budget — worth a mid-size rule (hide `.ax-opt2` below 1024 rather than 820).
4. **Tables** (§3.5) and the **hover-only** host affordances (§2b #22) are not in the layer yet.
5. `.ax-swatch` sizing (§3.12) and the hero banner type floor (§3.10) also are not in the layer.

---

## 7. One-screen summary

* **Surfaces mapped:** 29 (§1), from the 20px status bar down to the copy button on a code block.
* **Touch offenders:** 23 element types — 15 theme-owned (§2a) + 8 host types the theme compresses or
  leaves exposed (§2b); ≈87 rendered instances with the settings panel and one picker open.
* **Most severe narrow-viewport bug:** `.ax-status` keeps `white-space:nowrap; overflow:hidden` and
  needs ≈570–710px of segments at 390px, so 46–82% of the bar — clock, run count, toast — is clipped
  and unhittable, with no scroll path (§3.1).
* **Drawer:** the host provides none — only a 28×28 / 36×36 toggle that re-expands the sidebar
  *in the grid track* (centre drops to 110px at 390px). The theme must implement its own drawer, or
  depend explicitly on `dsh-web-mobile` for one (§4c).
* **Recommended layout:** `src/mobile.css` (sibling of `skin.css`, imported in `client.js`, appended
  last in `installSkin`'s `<style>`; no `build.mjs` change) + `src/mobile.js` exporting
  `installMobile(ctx)` (the `matchMedia`/attribute probe, added to the `apply()` step list) while
  sheet/menu markup stays in the existing `Popup`/`MenuOverlay`/`StatusLine` components; prefs gain
  one field (`mobile`), attributes gain `data-ascii-mobile|touch|kb` (§5).
