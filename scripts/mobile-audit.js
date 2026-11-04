/**
 * ASCetic mobile audit — paste into a DevTools console on the running GUI at any
 * emulated viewport, or inject it through CDP:
 *
 *   Runtime.evaluate { expression: <this file>, returnByValue: true }
 *
 * It prints (and returns) one report object:
 *
 *   viewport            width x height, DPR, pointer class
 *   hOverflow           document wider than the viewport (R11)
 *   targets             interactive elements intersecting the viewport
 *   under24 / under44   violations of WCAG 2.2 AA and of the 44px touch target
 *   inputFonts          every editable's computed font-size (R9: >=16px on touch)
 *   status              bar height, its targets, whether each one is hit-testable
 *   sheets              open `.ax-menu` as a bottom sheet (width, rows, grip)
 *
 * Everything else the layer promises — the scrim, the drawer rows, the sheet
 * stacking — is visible in the screenshots under docs/screenshots.
 */
(() => {
  const W = innerWidth
  const H = innerHeight
  const touch = matchMedia('(pointer: coarse)').matches
  const compact = matchMedia('(pointer: coarse), (max-width: 767px), (max-height: 500px)').matches

  const box = (el) => {
    const b = el.getBoundingClientRect()
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), top: b.top, bottom: b.bottom, left: b.left, right: b.right }
  }
  const visible = (b) => b.bottom > 1 && b.top < H - 1 && b.right > 1 && b.left < W - 1
  const name = (el) => {
    const label = el.getAttribute('aria-label') || (el.innerText || '').trim().slice(0, 20) || (typeof el.className === 'string' ? el.className.slice(0, 20) : '') || ''
    return `${el.tagName.toLowerCase()}[${label}]`.slice(0, 56)
  }

  const SELECTOR = [
    'button', 'a[href]', 'input:not([type=hidden])', 'textarea',
    '[contenteditable=""]', '[contenteditable="true"]',
    '[role="button"]', '[role="menuitem"]', '[role="menuitemradio"]',
    '[role="option"]', '[role="tab"]', '[role="treeitem"]', '[role="switch"]',
  ].join(', ')

  const targets = []
  for (const el of document.querySelectorAll(SELECTOR)) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
    const b = box(el)
    if (!b.w || !b.h || !visible(b)) continue
    targets.push({ el: name(el), w: b.w, h: b.h, x: b.x, y: b.y })
  }

  const under24 = targets.filter((t) => t.w < 24 || t.h < 24)
  const under44 = targets.filter((t) => (t.w < 44 || t.h < 44) && !(t.w < 24 || t.h < 24))

  const inputFonts = [...document.querySelectorAll('input, textarea, [contenteditable=""], [contenteditable="true"], [data-composer-input]')]
    .filter((el) => getComputedStyle(el).display !== 'none')
    .map((el) => ({ el: name(el), fs: getComputedStyle(el).fontSize }))

  const bar = document.querySelector('.ax-status')
  const barTargets = bar
    ? [...bar.querySelectorAll('button')]
      .filter((b) => getComputedStyle(b).display !== 'none')
      .map((b) => {
        const r = b.getBoundingClientRect()
        const mid = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
        return { el: name(b), ...box(b), hit: !!mid && (b === mid || b.contains(mid)) }
      })
    : []

  const sheet = document.querySelector('.ax-menu')
  const sheetInfo = sheet
    ? {
      sheet: Math.round(sheet.getBoundingClientRect().width) >= W - 1,
      w: Math.round(sheet.getBoundingClientRect().width),
      h: Math.round(sheet.getBoundingClientRect().height),
      grip: !!sheet.querySelector('.ax-sheet-grip'),
      rows: [...sheet.querySelectorAll('.ax-menu-row')].map((r) => Math.round(r.getBoundingClientRect().height)),
      scrim: getComputedStyle(sheet, '::before').content !== 'none',
    }
    : null

  const report = {
    viewport: `${W}x${H} @${devicePixelRatio}x`,
    pointer: touch ? 'coarse' : 'fine',
    touchLayout: compact,
    hOverflow: document.documentElement.scrollWidth > W + 1,
    scrollWidth: document.documentElement.scrollWidth,
    targets: targets.length,
    under24: under24.length,
    under44: under44.length,
    under24List: under24.map((t) => `${t.el} ${t.w}x${t.h}`),
    under44List: [...new Set(under44.map((t) => `${t.el} ${t.w}x${t.h}`))].slice(0, 12),
    inputFonts,
    status: bar ? { h: Math.round(bar.getBoundingClientRect().height), targets: barTargets, summary: !!document.querySelector('.ax-summary') } : null,
    sheet: sheetInfo,
  }

  console.table({ viewport: report.viewport, pointer: report.pointer, targets: report.targets, under24: report.under24, under44: report.under44, hOverflow: report.hOverflow })
  if (report.under24List.length) console.warn('under 24x24:', report.under24List)
  if (report.under44List.length) console.info('under 44x44:', report.under44List)
  return report
})()
