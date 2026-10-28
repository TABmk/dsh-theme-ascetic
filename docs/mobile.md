# Mobile: touch layout and hit sizes

ASCetic was a desktop skin. On a 390px phone the conversation was readable (the
palette, the monospace column and the bubbles all held up) but the chrome around
it was not: the status line clipped its own right-hand segments, every status and
menu target was text-height, popovers were anchored popovers, the composer input
was 13px (iOS zooms on focus below 16px), nothing cleared a safe area, and the
drawer opened with no scrim.

This layer fixes that without giving up the vim/terminal idiom. It is one new
stylesheet (`src/mobile.css`) plus a small amount of JS in `client.js` (`client.js`
keeps the plugin's single-file shape; the CSS is appended after `skin.css` and
`density.css` so it wins ties against the density `body` rules).

Evidence and per-rule rationale: [research/mobile-ux.md](research/mobile-ux.md)
and [research/theme-surfaces.md](research/theme-surfaces.md).

## The rule that shapes everything

**Touch → one-thumb chrome. Mouse → the existing chrome.** Not "narrow → mobile".

```css
/* the touch status line, sheets, composer, drawer density */
@media (pointer: coarse), (max-width: 767px), (max-height: 500px) { … }
```

* `(max-width: 767px)` — a phone, or a narrow desktop window.
* `(max-height: 500px)` — a phone in landscape is *wide and short* (852×393); a
  width-only query hands it the tablet layout and a 20px status bar it has no
  room for.
* `(pointer: coarse)` — a tablet at 768px has a thumb, not a cursor, and its full
  desktop segment set needs ~870px, so it gets the thumb bar too.

`client.js` mirrors the same query (`TOUCH_Q`), so the markup and the CSS never
disagree about which status line is on screen. The sheet-only layout keeps the
narrower `COMPACT_Q`, so a tablet keeps anchored popovers.

## The status line

| Viewport | Bar |
|---|---|
| Desktop, fine pointer | unchanged: 20px vim bar, eleven segments |
| Phone / tablet (coarse) | 44px row: `⚙ │ ASCII │ ● RUN 12:34 · 1 tool · ▕███░░░▏ 32% ▴` |

The seat still renders all of its segments — they stay mounted because they own
the session hooks that publish the numbers — and `mobile.css` hides them. The
summary button opens the **status sheet**, which is the same data as an `htop`
panel, and its rows open the host's own activity / context / tokens dialogs.

Why a sheet and not more segments: eleven segments need ~870px. A phone has 390.
Collapsing to icons would still be ~10 targets across 390px with 8px of air, i.e.
one thumb-width each.

## Popovers → bottom sheets

Everything the skin floats above the status line (the ASCII menu, the palette and
density pickers, the stats sheet, and the host popovers the skin re-anchors with
`[data-ascii-docked]`) becomes a full-width sheet below 768px or on a short
viewport:

* full width, `max-width: 640px`, bottom-anchored, `max-height: min(72dvh, 640px)`,
  scrolls (`overscroll-behavior: contain`);
* a 45px grip row that doubles as the close button (`╭─ascii … ▾ close`);
* 48px rows, values right-aligned — the "htop panel" reading of the menu;
* `padding-bottom: calc(10px + env(safe-area-inset-bottom))`;
* a dimming scrim, painted by `.ax-menu::before` (`z-index: -1` inside the
  sheet's stacking context, `pointer-events: none` so the outside tap still
  reaches the page and closes the sheet);
* `z-index: 1200`, above the header; the drawer sits at 1300 so a sheet never
  covers an open drawer.

### Visible options instead of cycling

On desktop the `ASCII` menu cycles a value per click, which is fine with a mouse.
In a sheet it is the wrong control: worse, the `pal` / `den` swatch pickers are
hidden below 820px, so a phone user could only *cycle* — up to **18 taps** to
reach a palette out of 19.

So in the sheet the palette and density rows expand inline into a two-column
grid of 48px chips (palette chips carry a colour strip, and the selected one gets
an accent edge), and choosing one applies it and collapses the list. Every option
is visible and one tap away — the "prefer visible controls over menus" rule from
[Claude's MCP Apps design guidelines](https://claude.com/docs/connectors/building/mcp-apps/design-guidelines),
which also supplies the 320pt minimum viewport and "no interactive control flush
against an edge". Chat style and hero art keep the cycle row: they are changed
rarely and the chip grid would bury the toggles.

Desktop is untouched: the menu is still anchored 4px from the left, 300px wide,
18px rows.

## Drawer

The off-canvas drawer and its 28px toggle come from the companion
`dsh-web-mobile` plugin (that is where `[data-mobile-nav]` comes from — it is in
no `@deepseek-ai` package). Two gaps were the skin's to fill:

* **No scrim.** A fixed pseudo-element on the app frame paints *behind* the
  frame's own opaque background and never shows, so the scrim is a body-level
  element installed by `client.js` at `z-index: 1299` (the drawer is 1300).
  Detection is geometric, not attribute-based: the sidebar counts as "open as a
  drawer" when the conversation column starts behind it, which a sidebar in its
  own grid track never is. That keeps the scrim working if the companion plugin
  is absent.
* **22px rows.** The chosen density is a reading decision, not a navigation one:
  inside a coarse-pointer viewport the drawer gets 44px rows, 44px per-row `⋯`
  actions and a 44px search button, while the conversation keeps its density.

## Hit sizes: what was fixed, and what was deliberately left

Targets before → after, measured in the live GUI at 390×844 (iPhone-class,
DPR 3). Counted over targets intersecting the viewport, sheets closed.

| Surface | Before | After |
|---|---|---|
| Status segments | 11×18, 52×18, 180×18, 224×18 | 44×44, 72×44, 274×44 (all hit-testable) |
| Status menu rows | 18px tall, 12px type | 48px tall, 14px type; palette/density expand to 48px chips |
| Settings chips | 22px tall | 44px tall |
| Logo text input | 18px tall, 12px type | 36px tall, 16px type |
| Drawer rows | 22px | 44px |
| Drawer per-session `⋯` | 16×16 | 44×44 |
| Header icons (toggle, Files, Agent Team) | 28×28, 23×20 | 44×44 |
| Composer input | 13px type | 16px type (iOS zoom threshold) |
| Composer controls | 30×30, 4×28 | 40px tall; primary 44×44; collapsed chevrons ≥24 wide |
| Stats pills under the composer | 199×18, 59×18, 18×20 | 44px tall |
| Transcript Think / tool rows | 24px | 32px |
| **Sub-24px targets in view** | **4** | **0** |

Left alone on purpose:

* **Conversation tabs (26px).** Forcing them to 44px overlaps the header's title
  row — `dsh-web-mobile` compresses the header deliberately. They are 50–78px
  wide, so they remain hittable; raising them is that plugin's call.
* **Transcript rows at 32px, not 44.** A turn can contain hundreds of them;
  44px rows turn one turn into a page. 32 clears the WCAG 2.2 AA floor of 24
  with room.
* **Inline links inside messages** (~24px tall). They are text, not controls.
* **Composer control widths.** Nine controls share 356px. Forcing a width on the
  labelled ones (the model chip is 21px wide) makes them overlap at 320px, so
  only height is enforced.

## Safe areas and the keyboard

The host already sets `viewport-fit=cover` and
`interactive-widget=resizes-content`, so `env(safe-area-inset-*)` is live and was
simply unused. All four edges are used, not just the bottom: in landscape a
notched phone reserves ~47px on each side, so the status bar takes
`max(4px, env(safe-area-inset-left|right))` — which also keeps the first control
off the edge on devices that report no inset at all — and the sheets, the docked
popovers, the drawer and the horizontally scrolling strips (composer dock,
Markdown tables and code blocks, via `scroll-padding-inline`) all clear the
side insets.

`client.js` also watches `window.visualViewport` and writes `--ax-kb` plus a
`data-ascii-kb` flag (rAF-batched, 120px of hysteresis so the URL bar collapsing
is not mistaken for a keyboard). Chromium resizes the layout viewport itself;
WebKit always overlays the keyboard and has no opt-out
([WebKit 259770](https://bugs.webkit.org/show_bug.cgi?id=259770)), so on iOS the
sheet is lifted by `--ax-kb` instead of hiding behind it.

## Reduced motion

Unchanged: the running dots, the blinking hero cursor and the intro keep their
existing `prefers-reduced-motion` opt-outs. The new chrome adds no animation.

## How it was tested

Everything below was measured in the running GUI (Chrome, device emulation with
real `pointer: coarse`):

| Viewport | Result |
|---|---|
| 320×568 | no horizontal overflow, sheet fits and scrolls, sub-24px targets 0 |
| 390×844 | no overflow, status bar 45px, all 3 bar targets 44×44 and hit-testable |
| 852×393 landscape | compact via `max-height`, no overflow, summary 736px wide fits |
| 768×1024 tablet | summary bar (full segment set needs ~870px), no clipping |
| 1440×900 desktop | unchanged: 19px vim bar, 11 segments, anchored 300×228 menu, 22px rows, no scrim, 14px composer |

`scripts/mobile-audit.js` is the audit itself: paste it into a DevTools console
(or inject it through CDP) at any viewport and it prints the numbers above —
overflow, targets under 24 and under 44, input type sizes, status reachability.

Two things that pass never saw until an iPhone 16 profile (393×852 @3, coarse)
was used by hand, and both are fixed:

* the transcript's **"back to bottom"** pill only exists while the page is
  scrolled up — 34×34, drawn with the host's 0.5px ring and soft elevation
  shadows, which read as a pale box against the flat skin. It is 44×44 with a
  hairline now. **Run the audit twice: at rest and scrolled up.**
* **"load earlier"** is 22px tall and carries no class at all, so `:not([class])`
  is the only handle on it; it gets 36px.

Chrome's device emulation reports every `env(safe-area-inset-*)` as `0px` even on
an iPhone profile, so the safe-area padding cannot be verified there — it needs
a real device, or Safari's responsive mode.

### The header's status chips stay small on purpose

The "N subagents" and "N background jobs" chips sit in absolutely positioned
header boxes that are ~21px tall with `overflow: hidden`. A blanket 44px rule on
header buttons does not grow them, it slices them in half — so the rule was
removed and the chips keep their natural compact size (fully visible, 105-116px
wide). They are the one place the theme accepts a sub-44 target: the alternative
is hiding the only on-phone view of running subagents, or fighting the host's
absolute layout and pushing the chip 25px into the transcript.
