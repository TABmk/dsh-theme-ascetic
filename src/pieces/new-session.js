/*
 * new session: a framed three-row button in the ascii.rest manner, sized to
 * the sidebar, for mount() to play:
 *
 *   ╭──────────────────────────────╮
 *   │ [+] new session          ──> │
 *   ╰──────────────────────────────╯
 *
 * At rest it stands still. While `hot()` is true (hover or keyboard focus)
 * the frame turns heavy, a slanted glint keeps crossing it (heavy strokes,
 * shaded gaps, like the glint on an ascii.rest banner) and the arrow runs.
 */

const HEAVY = { '─': '━', '│': '┃', '╭': '┏', '╮': '┓', '╰': '┗', '╯': '┛' }
const BAND = 3 // glint width in cells
const SWEEP = 0.9 // seconds a glint takes to cross

const heavy = (ch) => HEAVY[ch] ?? ch

/** East Asian Wide and Fullwidth ranges: the characters drawn two cells across. */
const wide = (c) => c >= 0x1100 && (
  c <= 0x115f || c === 0x2329 || c === 0x232a
  || (c >= 0x2e80 && c <= 0xa4cf && c !== 0x303f)
  || (c >= 0xac00 && c <= 0xd7a3) || (c >= 0xf900 && c <= 0xfaff)
  || (c >= 0xfe10 && c <= 0xfe19) || (c >= 0xfe30 && c <= 0xfe6f)
  || (c >= 0xff00 && c <= 0xff60) || (c >= 0xffe0 && c <= 0xffe6)
)

/**
 * The width of `text` in cells: a wide character takes two, the rest one.
 * Padding by `String.length` leaves the row short by one cell per wide
 * character, which pushes the right border out of the frame.
 * @param {string} text - the text as it will be drawn.
 */
const cells = (text) => {
  let n = 0
  for (const ch of text) n += wide(ch.codePointAt(0)) ? 2 : 1
  return n
}

/**
 * `text` cut to at most `room` cells, with an ellipsis when anything is left out.
 * @param {string} text - the text as it will be drawn.
 * @param {number} room - the cells it may take.
 */
const fit = (text, room) => {
  if (cells(text) <= room) return text
  let out = ''
  let used = 0
  for (const ch of text) {
    const w = wide(ch.codePointAt(0)) ? 2 : 1
    if (used + w > room - 1) break
    out += ch
    used += w
  }
  return `${out}…`
}

/**
 * @param {number} cols - width in cells (at least 18).
 * @param {string} label - the button's own label, shown lower-case.
 * @param {() => boolean} hot - read every frame: hovered or focused.
 */
export function newSessionPiece(cols, label, hot) {
  const inner = cols - 2
  const arrow = '──>'
  const left = ` [+] ${label.toLowerCase()}`
  const room = inner - arrow.length - 1
  const shown = fit(left, room)
  const text = shown + ' '.repeat(room - cells(shown)) + arrow + ' '
  const rows = ['╭' + '─'.repeat(inner) + '╮', '│' + text + '│', '╰' + '─'.repeat(inner) + '╯']
  const travel = cols + BAND + 3

  return {
    meta: { name: 'new session', category: 'ui', note: 'a framed button with a passing glint', cols, rows: 3, fps: 20 },
    default: () => (t) => {
      const on = hot()
      const head = on ? Math.floor(((t % SWEEP) / SWEEP) * travel) : -99
      // the arrow's shaft runs while hot, its head stays: ━─> ─━>
      const run = on ? Math.floor(t * 8) % 2 : -1
      return rows.map((row, y) => {
        let out = ''
        let col = 0 // cell column: a wide character spans two
        for (const ch0 of row) {
          let ch = ch0
          const w = wide(ch.codePointAt(0)) ? 2 : 1
          if (run >= 0 && y === 1 && col >= inner - arrow.length && col < inner) {
            const k = col - (inner - arrow.length)
            if (k === run) ch = '━'
          }
          // a glint touching any cell of a wide character lights all of it
          const hit = (c) => { const d = head - y - c; return d >= 0 && d < BAND }
          const lit = hit(col) || (w === 2 && hit(col + 1))
          if (lit) ch = ch === ' ' ? (y === 1 ? '░' : ch) : heavy(ch)
          else if (on && y !== 1) ch = heavy(ch)
          else if (on && (col === 0 || col + w === cols)) ch = heavy(ch)
          out += ch
          col += w
        }
        return out
      }).join('\n')
    },
  }
}
