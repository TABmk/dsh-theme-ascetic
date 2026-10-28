/**
 * dsh-theme-ascetic (ASCetic) — browser half.
 *
 * Bundled by scripts/build.mjs into the window.__ModuleLoader__ closure
 * factory; the only runtime require() target is the platform's 'react'.
 * ascii.rest is bundled in, so nothing is fetched at run time.
 *
 * Contributions, each undone by ctx.effect on unload:
 *   1. a token override layer (ctx.theme.overrideTokens) — the palette;
 *   2. skin + density stylesheets and the html[data-ascii*] switches;
 *   3. a vim-style status line in `shell.bottom` (session seat inside, and
 *      the sidebar's account menu behind a gear);
 *   4. an ascii.rest hero in `conversation.hero.brand.mark`;
 *   5. a settings row in `settings.general.item`;
 *   6. an ascii.rest-style framed New Session button in the sidebar;
 *   7. a retro boot intro (the DEEPSEEK logo under CRT scanlines).
 */
import React from 'react'
import { mount } from 'ascii.rest'
import { banner } from 'ascii.rest/banner'
import * as blackHole from 'ascii.rest/pieces/black-hole'
import * as earth from 'ascii.rest/pieces/earth'
import * as eclipse from 'ascii.rest/pieces/eclipse'
import * as galaxy from 'ascii.rest/pieces/galaxy'
import * as planet from 'ascii.rest/pieces/planet'
import * as torusKnot from 'ascii.rest/pieces/torus-knot'
import * as matrixRain from 'ascii.rest/pieces/matrix-rain'
import * as radar from 'ascii.rest/pieces/radar'
import * as synthwave from 'ascii.rest/pieces/synthwave'
import * as chatPiece from './pieces/chat.js'
import { newSessionPiece } from './pieces/new-session.js'
import { playIntro } from './intro.js'
import { PALETTE_CHOICES, PALETTE_GROUPS, pinnedScheme, previewOf, tokenLayer } from './palettes.js'
import { CHAT_STYLES, DEFAULTS, DENSITIES, HEROES, LOGO_MAX, prefs, watchStorage } from './prefs.js'
import { DENSITY_CSS, DENSITY_ROWS } from './density.js'
import MOBILE_CSS from './mobile.css'
import SKIN_CSS from './skin.css'

const SOURCE = 'dsh-theme-ascetic'
const h = React.createElement

/** Phone layout: narrow, or short (a phone in landscape is wide and short). */
const COMPACT_Q = '(max-width: 767px), (max-height: 500px)'
/** No cursor at all: the bar the status line draws for a thumb, at any width. */
const TOUCH_Q = `(pointer: coarse), ${COMPACT_Q}`

/* ---------- shared helpers ------------------------------------------------ */

function usePrefs() {
  return React.useSyncExternalStore(prefs.subscribe, prefs.get, prefs.get)
}

/** Follow a media query the way usePrefs follows storage. */
function useMedia(query) {
  const read = () => typeof matchMedia === 'function' && matchMedia(query).matches
  const subscribe = React.useCallback((fn) => {
    if (typeof matchMedia !== 'function') return () => {}
    const mq = matchMedia(query)
    mq.addEventListener('change', fn)
    return () => { mq.removeEventListener('change', fn) }
  }, [query])
  return React.useSyncExternalStore(subscribe, read, read)
}

/**
 * The numbers the compact status row summarises, published by the session seat
 * (which owns the session-scope hooks) for the sheet drawn in `shell.overlay`,
 * outside that scope. Same shape as `notice` and `menu`.
 */
const dash = {
  value: null,
  key: '',
  listeners: new Set(),
  /** Shallow merge: the seat and the status line publish different halves. */
  set(patch) {
    const next = { ...dash.value, ...patch }
    const key = JSON.stringify(next)
    if (key === dash.key) return
    dash.key = key
    dash.value = next
    for (const fn of dash.listeners) fn()
  },
  subscribe(fn) {
    dash.listeners.add(fn)
    return () => { dash.listeners.delete(fn) }
  },
  get: () => dash.value,
}

/** Transient one-line message shown in the status line. */
const notice = {
  text: '',
  listeners: new Set(),
  show(text) {
    notice.text = text
    for (const fn of notice.listeners) fn()
    clearTimeout(notice.timer)
    notice.timer = setTimeout(() => {
      notice.text = ''
      for (const fn of notice.listeners) fn()
    }, 2200)
  },
  subscribe(fn) {
    notice.listeners.add(fn)
    return () => { notice.listeners.delete(fn) }
  },
  get: () => notice.text,
}

/**
 * Which status-line popup is open ('ascii', 'palette', 'density' or null),
 * shared by the status line and the overlay that draws it.
 */
const menu = {
  open: null,
  right: 4, // px from the window's right edge: where a picker's right side sits
  listeners: new Set(),
  set(open) {
    if (menu.open === open) return
    menu.open = open
    for (const fn of menu.listeners) fn()
  },
  /** Open `kind` (over `segment`, for a picker), or close it if it is open. */
  toggle(kind, segment) {
    if (segment) menu.right = Math.max(4, Math.round(window.innerWidth - segment.getBoundingClientRect().right))
    menu.set(menu.open === kind ? null : kind)
  },
  subscribe(fn) {
    menu.listeners.add(fn)
    return () => { menu.listeners.delete(fn) }
  },
  get: () => menu.open,
}

function formatTokens(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '–'
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`
  return String(Math.round(n))
}

function pad2(n) { return String(n).padStart(2, '0') }

function elapsed(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return s >= 3600 ? `${Math.floor(s / 3600)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`
}

/** Text meter: ▕██████░░░░▏ in ten cells. */
function meter(ratio, cells = 10) {
  const r = Math.max(0, Math.min(1, ratio))
  const full = Math.round(r * cells)
  return ['█'.repeat(full), '░'.repeat(cells - full)]
}

/** Re-render on an interval while `active`. */
function useTick(ms, active = true) {
  const [, beat] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => {
    if (!active) return undefined
    const id = setInterval(beat, ms)
    return () => { clearInterval(id) }
  }, [ms, active])
}

/** Play an ascii.rest piece inside the element behind `ref`. */
function usePiece(ref, make, deps) {
  React.useEffect(() => {
    const el = ref.current
    if (el === null) return undefined
    let stop
    try {
      stop = mount(el, make())
    } catch (error) {
      console.warn(`${SOURCE}: ascii.rest piece failed`, error)
      el.textContent = ''
    }
    return () => { if (typeof stop === 'function') stop() }
  }, deps)
}

/**
 * A theme must never take the app down with it: every component this plugin
 * registers renders inside this boundary, which swallows its own crash.
 */
class Guard extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn(`${SOURCE}: ${this.props.label} crashed and was hidden`, error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function guarded(label, Comp) {
  function Guarded(props) {
    return h(Guard, { label }, h(Comp, props))
  }
  Guarded.displayName = `AsciiGuard(${label})`
  return Guarded
}

/* ---------- 1+2. palette layer and document switches --------------------- */

function applyDocument(ctx, p) {
  const root = document.documentElement
  root.dataset.ascii = ''
  root.dataset.asciiDensity = p.density
  root.dataset.asciiPalette = p.palette
  root.dataset.asciiChat = p.chat
  if (p.glyphs) root.dataset.glyphs = ''; else delete root.dataset.glyphs
  if (p.crt) root.dataset.asciiCrt = ''; else delete root.dataset.asciiCrt
  if (p.brand) delete root.dataset.asciiNoBrand; else root.dataset.asciiNoBrand = ''
  if (p.dock) delete root.dataset.asciiNoDock; else root.dataset.asciiNoDock = ''
  if (p.statusline) delete root.dataset.asciiNoStatus; else root.dataset.asciiNoStatus = ''
  const pin = pinnedScheme(p.palette)
  if (pin) root.dataset.asciiPin = pin; else delete root.dataset.asciiPin
  let scheme = pin
  if (scheme === null) {
    try { scheme = ctx.theme.getTheme().active.colorScheme } catch { scheme = 'light' }
  }
  root.dataset.asciiScheme = scheme
}

function clearDocument() {
  const root = document.documentElement
  for (const key of ['ascii', 'asciiDensity', 'asciiPalette', 'glyphs', 'asciiCrt', 'asciiNoBrand', 'asciiNoDock', 'asciiNoStatus', 'asciiChat', 'asciiPin', 'asciiScheme', 'asciiKb']) {
    delete root.dataset[key]
  }
  root.style.removeProperty('--ax-pop-x')
  root.style.removeProperty('--ax-kb')
}

function installSkin(ctx) {
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = SOURCE
    tag.dataset.pluginCss = `${SOURCE}/skin.css`
    tag.textContent = `${SKIN_CSS}\n${DENSITY_CSS}\n${MOBILE_CSS}`
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'ascii: stylesheets')

  ctx.effect(() => {
    let palette = null
    let disposeTokens = () => {}
    const sync = (p) => {
      applyDocument(ctx, p)
      if (p.palette === palette) return
      palette = p.palette
      disposeTokens()
      const layer = tokenLayer(p.palette)
      disposeTokens = layer === null ? () => {} : ctx.theme.overrideTokens(SOURCE, layer)
    }
    sync(prefs.get())
    const unsubscribe = prefs.subscribe(sync)
    return () => {
      unsubscribe()
      disposeTokens()
      clearDocument()
    }
  }, 'ascii: palette layer')

  ctx.effect(watchStorage, 'ascii: cross-window prefs')

  // Follow the host's light/dark flips for the auto and host palettes.
  ctx.effect(() => ctx.on('theme/change', () => applyDocument(ctx, prefs.get())), 'ascii: theme follow')
}

/* ---------- 3. status line ------------------------------------------------- */

/**
 * A block sweeping back and forth over a dotted track with a fading trail,
 * as a one-row piece played by ascii.rest's mount(): `··░▒▓█··`.
 */
const SCAN_WIDTH = 8
const SCAN_TRAIL = '█▓▒░'
const SCAN = {
  meta: { name: 'scan', category: 'ui', note: 'a block sweeping across a dotted track', cols: SCAN_WIDTH, rows: 1, fps: 16 },
  default: () => (t) => {
    const span = 2 * (SCAN_WIDTH - 1)
    const step = Math.floor(t * 16) % span
    const head = step < SCAN_WIDTH ? step : span - step
    const dir = step < SCAN_WIDTH ? 1 : -1
    let out = ''
    for (let x = 0; x < SCAN_WIDTH; x += 1) {
      const behind = (head - x) * dir
      out += behind >= 0 && behind < SCAN_TRAIL.length ? SCAN_TRAIL[behind] : '·'
    }
    return out
  },
}

function Scanner() {
  const ref = React.useRef(null)
  usePiece(ref, () => SCAN, [])
  return h('span', { ref, className: 'ax-scan', 'aria-hidden': true, 'data-ascii-art': '' })
}

const NO_HOOK = () => undefined

/** The chat fold's per-turn data: `legacy` in 0.2.x, top level in older builds. */
const chatFold = (c) => c?.legacy ?? c

/**
 * Fold the open Session into what the status line shows. The seat is
 * `session-maybe`, so on the blank-session page the hooks yield undefined.
 */
function useSessionFacts(useSession, useChat) {
  const running = useSession((s) => s?.running === true) === true
  const active = useChat((c) => (Array.isArray(chatFold(c)?.runningCalls) ? chatFold(c).runningCalls.length : 0)) ?? 0
  const nodes = useChat((c) => chatFold(c)?.nodes)
  const turns = useChat((c) => chatFold(c)?.turnTimings)
  // Fallback clock for builds without turn timings: when this page saw the run start.
  const seen = React.useRef(null)
  if (running && seen.current === null) seen.current = Date.now()
  if (!running) seen.current = null
  return React.useMemo(() => {
    let ok = 0
    let err = 0
    for (const node of Array.isArray(nodes) ? nodes : []) {
      if (node?.kind === 'tool-result') { if (node.isError) err += 1; else ok += 1 }
    }
    let turnStart = null
    if (running && turns && typeof turns.values === 'function') {
      for (const t of turns.values()) if (t && t.endTime == null && typeof t.startTime === 'number') turnStart = t.startTime
    }
    return { running, active, ok, err, turnStart: turnStart ?? seen.current }
  }, [running, active, nodes, turns])
}

/* ---------- stock statistics popovers, docked to the status line ---------- */

/** The composer-dock triggers whose popovers a status segment opens. */
const STAT_TRIGGERS = {
  activity: '[data-composer-stat="activity"] button',
  usage: '[data-composer-stat="usage"] button',
  context: 'button[class*="_trigger"]',
}

/** The main conversation's composer dock (the widest when sidebar chats exist). */
function mainDock() {
  const width = (el) => el.closest('[data-conversation-content]')?.clientWidth ?? 0
  return [...document.querySelectorAll('[data-composer-dock]')].sort((a, b) => width(b) - width(a))[0] ?? null
}

function statTrigger(kind) {
  return mainDock()?.querySelector(STAT_TRIGGERS[kind]) ?? null
}

/**
 * Open the stock popup behind a host trigger, pinned above the status segment
 * that asked for it. The trigger keeps owning the popup (data, focus,
 * dismissal); the skin only moves what it portals into <body>, through html
 * --ax-pop-x and a data-ascii-docked mark on the new popup. Works while the
 * trigger itself is hidden.
 * @param {HTMLElement} trigger - the host button that opens the popup.
 * @param {HTMLElement} segment - the status segment the popup should sit over.
 * @param {boolean} wasOpen - whether this popup was open when the press began.
 * @param {'dialog' | 'menu'} role - the popup's role.
 */
function openDocked(trigger, segment, wasOpen, role) {
  if (wasOpen) return // the press outside already closed it: a second click toggles off
  document.documentElement.style.setProperty('--ax-pop-x', `${Math.round(segment.getBoundingClientRect().left)}px`)
  const popups = () => document.querySelectorAll(`[role="${role}"]`)
  const before = new Set(popups())
  const mark = () => {
    for (const d of popups()) if (!before.has(d)) d.dataset.asciiDocked = ''
  }
  const watch = new MutationObserver(mark)
  watch.observe(document.body, { childList: true, subtree: true })
  setTimeout(() => { watch.disconnect() }, 600)
  trigger.click()
  mark()
}

/**
 * Open the stock popover behind one dock pill. Works while the dock row
 * itself is hidden.
 * @param {string} kind - key of STAT_TRIGGERS.
 */
function openStat(kind, segment, wasOpen) {
  const trigger = statTrigger(kind)
  if (trigger === null) { notice.show('no stats for this view'); return }
  openDocked(trigger, segment, wasOpen, 'dialog')
}

/** A status segment that opens the stock popover of the same name. */
function StatButton({ kind, title, className = '', children }) {
  const wasOpen = React.useRef(false)
  return h('button', {
    className: `ax-seg ax-stat ${className}`,
    title,
    'data-ascii-stat': kind,
    onPointerDown: () => { wasOpen.current = statTrigger(kind)?.getAttribute('aria-expanded') === 'true' },
    onClick: (e) => { openStat(kind, e.currentTarget, wasOpen.current); wasOpen.current = false },
  }, children)
}

/** The sidebar's account menu ("··· More": settings, feedback, account). */
const MORE_TRIGGER = '[data-slot="settings.launcher"] button[aria-haspopup="menu"]'

/**
 * The gear: opens the account menu from the sidebar's foot above the status
 * line. The skin hides the sidebar button while the status line shows.
 */
function GearButton() {
  const wasOpen = React.useRef(false)
  const trigger = () => document.querySelector(MORE_TRIGGER)
  return h('button', {
    className: 'ax-seg ax-gear',
    title: 'more: settings, feedback, account',
    'aria-label': 'More',
    'aria-haspopup': 'menu',
    onPointerDown: () => { wasOpen.current = trigger()?.getAttribute('aria-expanded') === 'true' },
    onClick: (e) => {
      const t = trigger()
      if (t === null) notice.show('no menu here')
      else openDocked(t, e.currentTarget, wasOpen.current, 'menu')
      wasOpen.current = false
    },
  }, '⚙︎')
}

/** Session seat: the useSession / useChat / useProjection standard hooks, when a Session is open. */
function StatusSession(props) {
  const useSession = typeof props.useSession === 'function' ? props.useSession : NO_HOOK
  const useChat = typeof props.useChat === 'function' ? props.useChat : NO_HOOK
  const useProjection = typeof props.useProjection === 'function' ? props.useProjection : NO_HOOK
  const facts = useSessionFacts(useSession, useChat)
  const pressure = useProjection('contextPressure')
  const usage = useProjection('tokenUsage')
  const stats = useProjection('sessionStats')
  useTick(1000, facts.running)

  const segs = []
  if (facts.running) {
    segs.push(h('span', { key: 'state', className: 'ax-seg ax-state-run' },
      h(Scanner), 'RUN', facts.turnStart !== null ? h('span', null, elapsed(Date.now() - facts.turnStart)) : null,
      facts.active > 0 ? h('span', { className: 'ax-dim' }, `${facts.active} tool${facts.active === 1 ? '' : 's'}`) : null))
  } else {
    segs.push(h('span', { key: 'state', className: 'ax-seg ax-idle' }, props.sessionId ? '○ IDLE' : '○ NEW'))
  }

  // Same fold as the dock's activity pill: decode tokens over decode time.
  if (stats && typeof stats.turns === 'number' && stats.turns > 0) {
    const tps = stats.decodeMs > 0 && stats.decodeTokens > 0 ? stats.decodeTokens / (stats.decodeMs / 1000) : null
    segs.push(h(StatButton, { key: 'act', kind: 'activity', title: 'session statistics: LLM / tool time, TTFT, TPS' },
      stats.turns, h('span', { className: 'ax-dim' }, stats.turns === 1 ? 'turn' : 'turns'),
      stats.steps ?? 0, h('span', { className: 'ax-dim' }, stats.steps === 1 ? 'step' : 'steps'),
      tps !== null ? h('span', null, `${Math.round(tps)}`, h('span', { className: 'ax-dim' }, ' tok/s')) : null))
  }

  const capacity = pressure && typeof pressure.contextWindow === 'number' && pressure.contextWindow > 0 ? pressure.contextWindow : null
  const used = pressure && typeof pressure.projectedTokens === 'number' ? pressure.projectedTokens : null
  if (capacity !== null && used !== null) {
    const ratio = used / capacity
    const [full, empty] = meter(ratio)
    const tone = ratio >= 0.9 ? ' ax-full' : ratio >= 0.7 ? ' ax-hot' : ''
    segs.push(h(StatButton, { key: 'ctx', kind: 'context', title: `context ${formatTokens(used)} / ${formatTokens(capacity)}: breakdown` },
      h('span', { className: 'ax-dim' }, 'ctx'),
      h('span', { className: `ax-bar${tone}` }, '▕', full, h('span', { className: 'ax-dim' }, empty), '▏'),
      `${Math.round(ratio * 100)}%`,
      h('span', { className: 'ax-dim' }, `${formatTokens(used)}/${formatTokens(capacity)}`)))
  }

  const read = usage?.cacheReadTokens ?? 0
  const input = (usage?.uncachedInputTokens ?? 0) + read + (usage?.cacheWriteTokens ?? 0)
  if (input + (usage?.outputTokens ?? 0) > 0) {
    segs.push(h(StatButton, { key: 'tok', kind: 'usage', className: 'ax-opt', title: 'session tokens: input ↑ / output ↓ / cache hit: details' },
      h('span', { className: 'ax-dim' }, 'tok'),
      `↑${formatTokens(input)}`, `↓${formatTokens(usage.outputTokens)}`,
      input > 0 ? h('span', { className: 'ax-dim' }, `hit ${Math.round((read / input) * 100)}%`) : null))
  }

  if (facts.ok + facts.err > 0) {
    segs.push(h('span', { key: 'tools', className: 'ax-seg ax-opt', title: 'tool calls: ok / failed' },
      h('span', { className: 'ax-dim' }, 'tools'),
      h('span', { className: 'ax-ok' }, `${facts.ok}✓`),
      facts.err > 0 ? h('span', { className: 'ax-err' }, `${facts.err}✗`) : null))
  }

  // The compact bar and its sheet read the same numbers from `dash`: they are
  // drawn outside the session scope, so the seat publishes what it folded.
  const tps = stats && typeof stats.decodeMs === 'number' && stats.decodeMs > 0 && typeof stats.decodeTokens === 'number' && stats.decodeTokens > 0
    ? stats.decodeTokens / (stats.decodeMs / 1000)
    : null
  React.useEffect(() => {
    dash.set({
      sessionId: props.sessionId ?? null,
      running: facts.running,
      active: facts.active,
      ok: facts.ok,
      err: facts.err,
      turnStart: facts.turnStart,
      turns: stats && typeof stats.turns === 'number' ? stats.turns : null,
      steps: stats?.steps ?? null,
      tokPerSec: tps,
      context: capacity !== null && used !== null ? { used, capacity } : null,
      tokens: input + (usage?.outputTokens ?? 0) > 0 ? { input, output: usage?.outputTokens ?? 0, read } : null,
    })
  })

  return h(React.Fragment, null, segs)
}

/** Sessions running anywhere in the app (root-scoped `useSessions` selector hook). */
function useRunningCount(props) {
  const useSessions = typeof props.useSessions === 'function' ? props.useSessions : NO_HOOK
  const count = useSessions((s) => {
    let n = 0
    for (const id of Array.isArray(s?.ids) ? s.ids : []) if (s.byId?.[id]?.running === true) n += 1
    return n
  })
  return typeof count === 'number' ? count : 0
}

/**
 * A popup above the status line: closes on Escape, a resize (it is placed
 * once) or a press outside it (its own toggles excepted, they toggle it), and
 * arrow keys walk its rows. On a phone the same element is a bottom sheet
 * (mobile.css), and the sheet gets a grip row that doubles as its close button.
 */
function Popup({ className, style, title, onClose, children }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const onDown = (e) => {
      if (ref.current?.contains(e.target) || e.target.closest?.('[data-ascii-menu-toggle]')) return
      onClose()
    }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', onClose)
    const el = ref.current
    // Focus the chosen row (or the first real row): the sheet grip is a close
    // affordance and focusing it draws a ring across the sheet's top edge.
    const rows = [...(el?.querySelectorAll('button') ?? [])].filter((b) => !b.classList.contains('ax-sheet-grip'))
    ;(el?.querySelector('[aria-checked="true"]') ?? rows[0])?.focus()
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const rows = [...ref.current.querySelectorAll('button')]
    const at = rows.indexOf(document.activeElement)
    rows[(at + (e.key === 'ArrowDown' ? 1 : rows.length - 1)) % rows.length]?.focus()
  }
  return h('div', { ref, className, style, role: 'menu', onKeyDown },
    h(SheetGrip, { title, onClose }),
    children)
}

/** The compact sheet's grabber: a full-width close row, not a 4px bar. */
function SheetGrip({ title, onClose }) {
  const compact = useMedia(COMPACT_Q)
  if (!compact) return null
  return h('button', {
    role: 'menuitem',
    className: 'ax-sheet-grip',
    'aria-label': `close ${title || 'menu'}`,
    onClick: onClose,
  },
  h('span', null, '╭─', title || 'menu'),
  h('span', { className: 'ax-hint' }, '▾ close'))
}

function QuickMenu({ p, onClose }) {
  const compact = useMedia(COMPACT_Q)
  const [expanded, setExpanded] = React.useState(null)
  const row = (key, label, value, onClick) => h('button', { key, className: 'ax-menu-row', onClick },
    h('span', null, label), h('span', { className: 'ax-key' }, value))
  // A cycle row is fine with a mouse. In a sheet it is up to 18 taps to reach
  // one of the 19 palettes, so the sheet expands the list inline instead:
  // every option visible, one tap to choose.
  const pick = (key, label, field, values) => {
    if (!compact) {
      return row(key, label, `< ${p[field]} >`, () => prefs.cycle(field, values))
    }
    const open = expanded === field
    return h(React.Fragment, { key },
      h('button', {
        className: 'ax-menu-row',
        'aria-expanded': open,
        'aria-haspopup': 'listbox',
        onClick: () => setExpanded(open ? null : field),
      },
      h('span', null, label),
      h('span', { className: 'ax-key' }, p[field]),
      h('span', { className: 'ax-caret' }, open ? '▾' : '▸')),
      open ? h('div', { className: 'ax-options', role: 'listbox', 'aria-label': label },
        values.map((v) => h('button', {
          key: v,
          role: 'option',
          className: 'ax-option',
          'aria-selected': p[field] === v,
          onClick: () => { prefs.set({ [field]: v }); setExpanded(null) },
        },
        field === 'palette' ? h(Swatch, { choice: v }) : null,
        h('span', { className: 'ax-option-name' }, v),
        field === 'density' ? h('span', { className: 'ax-dim ax-option-hint' }, DENSITY_ROWS[v]) : null))) : null)
  }
  return h(Popup, { className: 'ax-menu', title: 'ascii', onClose },
    h('div', { className: 'ax-menu-title' }, compact ? '┌─ ascii' : '┌─ ascii ─ click to cycle'),
    pick('pal', 'palette', 'palette', PALETTE_CHOICES),
    pick('den', 'density', 'density', DENSITIES),
    row('chat', 'chat style', `< ${p.chat} >`, () => prefs.cycle('chat', CHAT_STYLES)),
    row('hero', 'hero art', `< ${p.hero} >`, () => prefs.cycle('hero', HEROES)),
    h('label', { key: 'logo', className: 'ax-menu-row ax-menu-field' }, h('span', null, 'logo text'), h(LogoInput)),
    row('gly', 'glyphs  # > [+] `code`', p.glyphs ? '[x]' : '[ ]', () => prefs.set({ glyphs: !p.glyphs })),
    row('crt', 'crt scanlines', p.crt ? '[x]' : '[ ]', () => prefs.set({ crt: !p.crt })),
    row('brand', 'sidebar logo', p.brand ? '[x]' : '[ ]', () => prefs.set({ brand: !p.brand })),
    row('dock', 'chat stats row', p.dock ? '[x]' : '[ ]', () => prefs.set({ dock: !p.dock })),
    row('sl', 'status line', p.statusline ? '[x]' : '[ ]', () => prefs.set({ statusline: !p.statusline })),
    row('intro', 'boot intro', p.intro ? '[x]' : '[ ]', () => prefs.set({ intro: !p.intro })),
  )
}

/** A palette as a strip of solid cells: paper, surface, dim ink, ink, then a wide accent. */
function Swatch({ choice }) {
  return h('span', { className: 'ax-swatches', 'aria-hidden': true }, previewOf(choice).map((c, i) =>
    h('span', { key: i, className: 'ax-swatch' },
      [c.bg, c.bg2, c.ink2, c.ink, c.accent].map((background, j) => h('i', { key: j, style: { background } })))))
}

const PICKERS = {
  palette: { groups: PALETTE_GROUPS, hint: (v) => h(Swatch, { choice: v }) },
  density: { groups: [{ items: DENSITIES }], hint: (v) => h('span', { className: 'ax-dim' }, `rows ${DENSITY_ROWS[v]}`) },
}

/** A pick-one list for a status segment (palette, density), right under its toggle. */
function Picker({ field, p, onClose }) {
  const { groups, hint } = PICKERS[field]
  const option = (value) => h('button', {
    key: value,
    className: 'ax-menu-row',
    role: 'menuitemradio',
    'aria-checked': p[field] === value,
    onClick: () => prefs.set({ [field]: value }),
  },
  h('span', { className: 'ax-radio' }, p[field] === value ? '(•)' : '( )'),
  h('span', null, value),
  h('span', { className: 'ax-hint' }, hint(value)))
  return h(Popup, { className: 'ax-menu ax-pick', style: { right: menu.right }, title: field, onClose },
    h('div', { className: 'ax-menu-title' }, `┌─ ${field}`),
    groups.map((group, i) => h(React.Fragment, { key: i },
      group.label ? h('div', { className: 'ax-menu-group', role: 'presentation' }, `── ${group.label}`) : null,
      group.items.map(option))))
}

/** A status segment that opens the picker for `field`. */
function PickButton({ field, label, open, value }) {
  return h('button', {
    className: 'ax-seg ax-right ax-opt2',
    title: `${field}: choose`,
    'aria-haspopup': 'menu',
    'aria-expanded': open === field,
    'data-ascii-menu-toggle': '',
    onClick: (e) => menu.toggle(field, e.currentTarget),
  }, h('span', { className: 'ax-dim' }, label), value)
}

/**
 * The compact bar's seat: the same facts on one line, one tap from the sheet.
 * A phone cannot hold eleven segments, so this is what the vim bar becomes —
 * the row keeps the state, the tool count and the context meter, and the sheet
 * behind it keeps everything else (including the stock popovers).
 */
function SummarySeg() {
  const d = React.useSyncExternalStore(dash.subscribe, dash.get, dash.get)
  const message = React.useSyncExternalStore(notice.subscribe, notice.get, notice.get)
  const open = React.useSyncExternalStore(menu.subscribe, menu.get, menu.get)
  useTick(1000, d?.running === true)
  const parts = []
  if (d?.running) {
    parts.push(h('span', { key: 'st', className: 'ax-run' }, '● RUN ',
      d.turnStart !== null && d.turnStart !== undefined ? h('span', null, elapsed(Date.now() - d.turnStart)) : null))
  } else {
    parts.push(h('span', { key: 'st', className: 'ax-idle' }, d?.sessionId ? '○ IDLE' : '○ NEW'))
  }
  if (d?.active > 0) parts.push(h('span', { key: 'tl', className: 'ax-dim' }, `${d.active} tool${d.active === 1 ? '' : 's'}`))
  if (d?.context) {
    const ratio = d.context.used / d.context.capacity
    const [full, empty] = meter(ratio)
    parts.push(h('span', { key: 'cx', className: 'ax-bar' }, '▕', full, h('span', { className: 'ax-dim' }, empty), '▏', `${Math.round(ratio * 100)}%`))
  }
  parts.push(h('span', { key: 'ch', className: 'ax-chev' }, '▴'))
  return h('button', {
    className: 'ax-seg ax-summary',
    'aria-haspopup': 'menu',
    'aria-expanded': open === 'stats',
    'data-ascii-menu-toggle': '',
    title: message || 'session state and statistics',
    onClick: () => menu.toggle('stats'),
  },
  message ? h('span', { key: 'msg', className: 'ax-toast' }, message) : parts)
}

/** The compact sheet: the vim bar as an htop panel, every row 48px. */
function StatsSheet({ onClose }) {
  const d = React.useSyncExternalStore(dash.subscribe, dash.get, dash.get) ?? {}
  const wasOpen = React.useRef(false)
  const row = (key, label, value, kind = null) => {
    if (value === null || value === undefined || value === '') return null
    const cells = [h('span', { key: 'l', className: 'ax-dim' }, label), h('span', { key: 'v', className: 'ax-hint' }, value)]
    if (kind === null) return h('div', { key, className: 'ax-menu-row ax-row-info' }, cells)
    return h('button', {
      key,
      className: 'ax-menu-row',
      title: `${label}: details`,
      onPointerDown: () => { wasOpen.current = statTrigger(kind)?.getAttribute('aria-expanded') === 'true' },
      onClick: (e) => {
        const el = e.currentTarget
        menu.set(null)
        openStat(kind, el, wasOpen.current)
        wasOpen.current = false
      },
    }, cells)
  }
  const state = d.running
    ? `● RUN ${d.turnStart !== null && d.turnStart !== undefined ? elapsed(Date.now() - d.turnStart) : ''}`.trim()
    : (d.sessionId ? '○ IDLE' : '○ NEW')
  const ctx = d.context
    ? `${Math.round((d.context.used / d.context.capacity) * 100)}% · ${formatTokens(d.context.used)}/${formatTokens(d.context.capacity)}`
    : null
  const tokens = d.tokens
    ? `↑${formatTokens(d.tokens.input)} ↓${formatTokens(d.tokens.output)}${d.tokens.input > 0 ? ` · hit ${Math.round((d.tokens.read / d.tokens.input) * 100)}%` : ''}`
    : null
  const activity = d.turns !== null && d.turns !== undefined
    ? `${d.turns} ${d.turns === 1 ? 'turn' : 'turns'} · ${d.steps ?? 0} steps${d.tokPerSec ? ` · ${Math.round(d.tokPerSec)} tok/s` : ''}`
    : null
  return h(Popup, { className: 'ax-menu ax-sheet', title: 'status', onClose },
    row('state', 'state', d.active > 0 ? `${state} · ${d.active} tool${d.active === 1 ? '' : 's'}` : state),
    row('act', 'activity', activity, 'activity'),
    row('ctx', 'context', ctx, 'context'),
    row('tok', 'tokens', tokens, 'usage'),
    row('tools', 'tools', d.ok + d.err > 0 ? `${d.ok}✓${d.err > 0 ? ` ${d.err}✗` : ''}` : null),
    row('run', 'running', d.runningGlobal > 0 ? `${d.runningGlobal} across workspaces` : null),
    row('clock', 'time', `${pad2(new Date().getHours())}:${pad2(new Date().getMinutes())}`))
}

function StatusLine(props) {
  const p = usePrefs()
  const message = React.useSyncExternalStore(notice.subscribe, notice.get, notice.get)
  const open = React.useSyncExternalStore(menu.subscribe, menu.get, menu.get)
  const running = useRunningCount(props)
  const compact = useMedia(TOUCH_Q)
  useTick(15000, p.statusline)
  // The sheet lists this beside the session's own counters.
  React.useEffect(() => { dash.set({ runningGlobal: running }) })
  if (!p.statusline) return null
  const now = new Date()
  // On a phone the bar carries three targets: the account menu, the theme
  // sheet and the seat. The seat's own segments stay mounted (they publish to
  // `dash`), and mobile.css hides them.
  if (compact) {
    return h('div', { className: 'ax-status', 'data-ascii-statusline': '' },
      h(GearButton),
      h('button', {
        className: 'ax-seg ax-mode',
        onClick: () => menu.toggle('ascii'),
        title: 'ASCII theme menu',
        'aria-expanded': open === 'ascii',
        'data-ascii-menu-toggle': '',
      }, 'ASCII'),
      h(SummarySeg),
      props.renderSlot('ascii.status.session', {}))
  }
  return h('div', { className: 'ax-status', 'data-ascii-statusline': '' },
    h(GearButton),
    h('button', {
      className: 'ax-seg ax-mode',
      onClick: () => menu.toggle('ascii'),
      title: 'ASCII theme menu',
      'aria-expanded': open === 'ascii',
      'data-ascii-menu-toggle': '',
    }, 'ASCII'),
    props.renderSlot('ascii.status.session', {}),
    message ? h('span', { className: 'ax-seg ax-toast' }, message) : null,
    h('span', { className: 'ax-fill' }),
    running > 0
      ? h('span', { className: 'ax-seg ax-right ax-run', title: 'sessions running across all workspaces' }, `● ${running} running`)
      : null,
    h(PickButton, { field: 'palette', label: 'pal', open, value: p.palette }),
    h(PickButton, { field: 'density', label: 'den', open, value: p.density }),
    h('span', { className: 'ax-seg ax-right' }, `${pad2(now.getHours())}:${pad2(now.getMinutes())}`),
  )
}

/** The status-line popups float in `shell.overlay`, outside the clipped bottom row. */
function MenuOverlay() {
  const p = usePrefs()
  const open = React.useSyncExternalStore(menu.subscribe, menu.get, menu.get)
  const close = React.useCallback(() => { menu.set(null) }, [])
  if (open === null || !p.statusline) return null
  if (open === 'ascii') return h(QuickMenu, { p, onClose: close })
  if (open === 'stats') return h(StatsSheet, { onClose: close })
  return h(Picker, { key: open, field: open, p, onClose: close })
}

function registerStatusLine(ctx) {
  ctx.slots.inject('shell.bottom', () => ctx.slots.register({
    name: 'shell.bottom',
    children: { 'ascii.status.session': { kind: 'single', scope: 'session-maybe' } },
  }, guarded('status line', StatusLine)))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'ascii.menu', order: 80 }, guarded('quick menu', MenuOverlay)))
  // The seat is declared by the shell.bottom entry above, so wait for it.
  ctx.slots.inject('ascii.status.session', () => ctx.slots.register(
    { name: 'ascii.status.session', id: 'ascii.status.session' }, guarded('status session', StatusSession)))
}

/* ---------- 3b. viewport --------------------------------------------------- */

/**
 * The one thing CSS units cannot tell us: whether the virtual keyboard is up.
 * `interactive-widget=resizes-content` resizes the layout viewport on Chromium,
 * so nothing is needed there, but WebKit always overlays the keyboard and has no
 * opt-out (bugs.webkit.org 259770), and iOS pans the visual viewport, so
 * offsetTop has to come out of the height. rAF-batched: the listeners fire in
 * bursts while the keyboard animates.
 */
function installViewport(ctx) {
  ctx.effect(() => {
    const vv = window.visualViewport
    const root = document.documentElement
    let raf = 0
    const apply = () => {
      raf = 0
      if (!vv) return
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      root.style.setProperty('--ax-kb', `${Math.round(kb)}px`)
      // 120px of hysteresis: the URL bar collapsing is not a keyboard
      if (kb > 120) root.dataset.asciiKb = ''
      else delete root.dataset.asciiKb
    }
    const schedule = () => { if (raf === 0) raf = requestAnimationFrame(apply) }
    if (vv) {
      vv.addEventListener('resize', schedule, { passive: true })
      vv.addEventListener('scroll', schedule, { passive: true })
    }
    apply()
    return () => {
      if (raf !== 0) cancelAnimationFrame(raf)
      if (vv) {
        vv.removeEventListener('resize', schedule)
        vv.removeEventListener('scroll', schedule)
      }
      root.style.removeProperty('--ax-kb')
      delete root.dataset.asciiKb
    }
  }, 'ascii: viewport')
}

/* ---------- 3c. drawer scrim ---------------------------------------------- */

/**
 * The scrim behind an off-canvas sidebar. It has to be a body-level element: a
 * fixed pseudo-element on the app frame paints behind the frame's own opaque
 * background and never shows, and the drawer itself sits at z-index 1300.
 *
 * Detection is geometric rather than attribute-based, so it holds whether the
 * drawer comes from the companion mobile plugin (which is where
 * `[data-mobile-nav]` comes from) or from a future host build: the sidebar is
 * "open as a drawer" when the conversation column starts behind it. A sidebar
 * sitting in its own grid track never satisfies that.
 */
function installDrawerScrim(ctx) {
  ctx.effect(() => {
    const scrim = document.createElement('div')
    scrim.className = 'ax-drawer-scrim'
    scrim.setAttribute('aria-hidden', 'true')
    let timer = 0
    const apply = () => {
      const side = document.querySelector('[class*="_sidebarCol"]')
      const conversation = document.querySelector('[data-conversation-content]')
      const narrow = !window.matchMedia || matchMedia('(max-width: 1023px)').matches
      let want = false
      if (side?.isConnected && narrow && conversation) {
        const drawer = side.getBoundingClientRect()
        const column = conversation.getBoundingClientRect()
        want = drawer.width > 1 && drawer.height > 1 && drawer.right > column.left + 1
      }
      if (want && !scrim.isConnected) document.body.append(scrim)
      else if (!want && scrim.isConnected) scrim.remove()
    }
    // A timer, not rAF: the drawer animates with a transition and rAF stalls
    // while the window is hidden.
    timer = setInterval(apply, 200)
    window.addEventListener('resize', apply, { passive: true })
    apply()
    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', apply)
      scrim.remove()
    }
  }, 'ascii: drawer scrim')
}

/* ---------- 4. hero art ---------------------------------------------------- */

const HERO_PIECES = {
  'black-hole': blackHole, earth, eclipse, galaxy, planet,
  'torus-knot': torusKnot, 'matrix-rain': matrixRain, radar, synthwave,
}

/** The ascii.rest chat piece, playing a harness-shaped talk (yours first). */
const HERO_TALK = [
  'fix the failing auth tests',
  'on it. reading src/auth first',
  'skip the e2e ones for now',
  'done: 14 passing, 0 failing. open a pr?',
  'yes, and keep it small',
  'pushed. the diff is 38 lines.',
]

function heroPiece(kind, logo) {
  if (kind === 'banner') return banner(logo, { font: 'block', shadow: 'single', effect: 'glint', speed: 0.6 })
  if (kind === 'chat') return { meta: chatPiece.meta, default: () => chatPiece.default({ messages: HERO_TALK }) }
  return HERO_PIECES[kind] ?? planet
}

/**
 * The arts themselves: what a click steps through, and what `random` draws
 * from. `stock` is left out, as it would take the hero away.
 */
const HERO_CYCLE = HEROES.filter((kind) => kind !== 'stock' && kind !== 'random')

/** Any art but `avoid` (the one on screen). */
function randomHero(avoid) {
  const pool = HERO_CYCLE.filter((kind) => kind !== avoid)
  return pool[Math.floor(Math.random() * pool.length)]
}

function HeroMark() {
  const p = usePrefs()
  // `random` draws once per mount, so every blank session gets its own
  const [drawn, setDrawn] = React.useState(() => randomHero())
  const random = p.hero === 'random'
  const kind = random ? drawn : p.hero
  const ref = React.useRef(null)
  const piece = React.useMemo(() => heroPiece(kind, p.logo), [kind, p.logo])
  usePiece(ref, () => piece, [piece])
  // a click steps to the next art, or draws another one in `random`
  const next = () => {
    if (random) {
      const other = randomHero(kind)
      setDrawn(other)
      notice.show(`hero: ${other} (random)`)
    } else {
      prefs.cycle('hero', HERO_CYCLE)
      notice.show(`hero: ${prefs.get().hero}`)
    }
  }
  // chat draws rounded box corners most monospace faces lack: a canvas keeps
  // its grid aligned whatever face supplies them (see installNewSessionArt)
  return h(kind === 'chat' ? 'canvas' : 'pre', {
    key: kind,
    ref,
    className: 'ax-hero',
    'data-ascii-hero': kind,
    'data-ascii-art': '',
    style: kind === 'banner' ? { '--ax-hero-cols': piece.meta.cols } : undefined,
    role: 'button',
    tabIndex: 0,
    'aria-label': random ? `hero art: ${kind}, picked at random; draw another` : `hero art: ${kind}, show the next one`,
    title: random ? `${kind} (random) · click for another` : `${kind} · click for the next art`,
    onClick: next,
    onKeyDown: (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      next()
    },
  })
}

function registerHero(ctx) {
  ctx.effect(() => {
    let dispose = null
    const sync = (p) => {
      const want = p.hero !== 'stock'
      if (want && dispose === null) {
        dispose = ctx.slots.inject('conversation.hero.brand.mark',
          () => ctx.slots.register({ name: 'conversation.hero.brand.mark' }, guarded('hero', HeroMark)))
      } else if (!want && dispose !== null) {
        dispose()
        dispose = null
      }
    }
    sync(prefs.get())
    const unsubscribe = prefs.subscribe(sync)
    return () => {
      unsubscribe()
      if (dispose !== null) dispose()
    }
  }, 'ascii: hero art')
}

/* ---------- 5. settings row ------------------------------------------------ */

function Choices({ field, list }) {
  const p = usePrefs()
  return h('div', { className: 'ax-choices', role: 'group' }, list.map((value) => h('button', {
    key: value,
    className: 'ax-choice',
    'aria-pressed': p[field] === value,
    onClick: () => prefs.set({ [field]: value }),
  }, value)))
}

function Toggle({ field }) {
  const p = usePrefs()
  return h('div', { className: 'ax-choices' }, h('button', {
    className: 'ax-choice',
    role: 'switch',
    'aria-checked': p[field],
    'aria-pressed': p[field],
    onClick: () => prefs.set({ [field]: !p[field] }),
  }, p[field] ? '[x] on' : '[ ] off'))
}

/**
 * The logo text (boot intro and banner hero). It types freely: every change
 * is stored as the banner can draw it, so the hero follows as you type, while
 * the field keeps your own spelling until it loses focus. Blank is DEEPSEEK.
 */
function LogoInput() {
  const p = usePrefs()
  const [draft, setDraft] = React.useState(p.logo)
  const editing = React.useRef(false)
  React.useEffect(() => { if (!editing.current) setDraft(p.logo) }, [p.logo])
  return h('input', {
    className: 'ax-input',
    value: draft,
    maxLength: LOGO_MAX,
    spellCheck: false,
    autoComplete: 'off',
    placeholder: DEFAULTS.logo,
    title: `up to ${LOGO_MAX}: A-Z 0-9 . , ! ? ' : - + = / _ (blank for ${DEFAULTS.logo})`,
    'aria-label': 'logo text',
    onFocus: () => { editing.current = true },
    onBlur: () => { editing.current = false; setDraft(prefs.get().logo) },
    onChange: (e) => { setDraft(e.target.value); prefs.set({ logo: e.target.value }) },
    onKeyDown: (e) => { if (e.key === 'Enter') e.currentTarget.blur() },
  })
}

function SettingsRow() {
  return h('div', { className: 'ax-settings' },
    h('div', { className: 'ax-settings-title' }, 'ASCetic', h('small', null, '// dsh-theme-ascetic')),
    h('label', null, 'palette'), h(Choices, { field: 'palette', list: PALETTE_CHOICES }),
    h('label', null, 'density'), h(Choices, { field: 'density', list: DENSITIES }),
    h('label', null, 'chat style'), h(Choices, { field: 'chat', list: CHAT_STYLES }),
    h('label', null, 'hero art'), h(Choices, { field: 'hero', list: HEROES }),
    h('label', null, 'logo text'), h(LogoInput),
    h('label', null, 'glyphs'), h(Toggle, { field: 'glyphs' }),
    h('label', null, 'status line'), h(Toggle, { field: 'statusline' }),
    h('label', null, 'crt'), h(Toggle, { field: 'crt' }),
    h('label', null, 'sidebar logo'), h(Toggle, { field: 'brand' }),
    h('label', null, 'chat stats row'), h(Toggle, { field: 'dock' }),
    h('label', null, 'boot intro'), h(Toggle, { field: 'intro' }),
  )
}

function registerSettings(ctx) {
  ctx.slots.inject('settings.general.item', () => ctx.slots.register(
    { name: 'settings.general.item', id: 'ascetic', order: 15 }, guarded('settings', SettingsRow)))
}

/* ---------- 6. New Session as a framed ascii.rest piece ------------------- */

/**
 * The sidebar's New Session button is the host's own (it owns the click, the
 * label and its accessibility); no slot reaches inside it, so the skin adds
 * one aria-hidden <canvas> to it and plays newSessionPiece there through
 * ascii.rest's mount(), sized to the button and re-sized with it. A canvas,
 * not a <pre>: mount() draws every character into its own grid cell, so box
 * corners and heavy strokes stay aligned even when the monospace font lacks
 * them and a wider fallback face supplies them. The host's own contents are
 * hidden by CSS while the piece is attached; the rail (collapsed sidebar)
 * keeps its plain plus icon.
 */
function installNewSessionArt(ctx) {
  ctx.effect(() => {
    const live = new Map()

    const attach = (btn) => {
      const art = document.createElement('canvas')
      art.className = 'ax-ns'
      art.setAttribute('aria-hidden', 'true')
      art.dataset.asciiArt = ''
      btn.append(art)
      btn.dataset.asciiNs = ''
      const hot = () => btn.matches(':hover, :focus-visible')
      let cols = 0
      let stop = () => {}
      const render = () => {
        // a cell is .6 of the font size wide, as mount() draws it
        const cell = (parseFloat(getComputedStyle(art).fontSize) || 12) * 0.6
        const next = Math.max(18, Math.floor(art.clientWidth / cell))
        if (next === cols || art.clientWidth === 0) return
        cols = next
        stop()
        const label = btn.querySelector('[class*="_newSessionLabel"]')?.textContent?.trim() || 'new session'
        try {
          stop = mount(art, newSessionPiece(cols, label, hot), { motion: false })
        } catch (error) {
          console.warn(`${SOURCE}: new session art failed`, error)
          stop = () => {}
        }
      }
      const resize = new ResizeObserver(render)
      resize.observe(art)
      render()
      live.set(btn, () => {
        resize.disconnect()
        stop()
        art.remove()
        delete btn.dataset.asciiNs
      })
    }

    const detach = (btn) => {
      live.get(btn)?.()
      live.delete(btn)
    }

    const sync = () => {
      for (const btn of [...live.keys()]) {
        if (!btn.isConnected || btn.closest('[class*="_collapsed"]')) detach(btn)
      }
      for (const btn of document.querySelectorAll('button[class*="_newSession"]')) {
        if (live.has(btn) || btn.closest('[class*="_collapsed"]')) continue
        // only the sidebar's button: its parent also holds the logo row
        if (!btn.parentElement?.querySelector(':scope > [class*="_logoRow"]')) continue
        attach(btn)
      }
    }

    // A timer, not requestAnimationFrame: rAF stalls while the window is hidden.
    let timer = 0
    const schedule = () => {
      if (timer === 0) timer = setTimeout(() => { timer = 0; sync() }, 40)
    }
    // Pieces repaint their own text many times a second: ignore those.
    const watch = new MutationObserver((records) => {
      for (const r of records) {
        const el = r.target.nodeType === 1 ? r.target : r.target.parentElement
        if (!el?.closest('[data-ascii-art]')) { schedule(); return }
      }
    })
    watch.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    sync()
    return () => {
      watch.disconnect()
      clearTimeout(timer)
      for (const btn of [...live.keys()]) detach(btn)
    }
  }, 'ascii: new session art')
}

/* ---------- 7. boot intro --------------------------------------------------- */

/**
 * The retro boot splash (intro.js), once per page load: a plugin reload or a
 * re-activation does not replay it.
 */
function installIntro(ctx) {
  ctx.effect(() => {
    if (!prefs.get().intro || globalThis.__dshAsciiIntroPlayed) return () => {}
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
    globalThis.__dshAsciiIntroPlayed = true
    return playIntro(prefs.get().logo, (error) => { console.warn(`${SOURCE}: intro piece failed`, error) })
  }, 'ascii: boot intro')
}

/* ---------- plugin body ---------------------------------------------------- */

function apply(ctx) {
  for (const step of [installSkin, installViewport, installDrawerScrim, installIntro, registerStatusLine, registerHero, registerSettings, installNewSessionArt]) {
    if (!__DEV__) { step(ctx); continue }
    try {
      step(ctx)
      console.info(`${SOURCE}: ${step.name} ok`)
    } catch (error) {
      console.error(`${SOURCE}: ${step.name} failed`, error)
      throw error
    }
  }
}

export { SOURCE as name, apply }
export const inject = ['theme', 'slots']
