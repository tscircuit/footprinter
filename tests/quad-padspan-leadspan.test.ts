import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("quad and tqfp support padspan and leadspan parameters", () => {
  // Default tqfp64 with w10_h10 places pad centers at +/-(w/2 + pl/2 - 0.1) = +/-5.6375 (11.275mm span)
  const defaultSoup = fp.string("tqfp64_w10_h10_p0.5mm").circuitJson()
  const defaultPads = defaultSoup.filter((el) => el.type === "pcb_smtpad")
  const minXDefault = Math.min(...defaultPads.map((p: any) => p.x))
  const maxXDefault = Math.max(...defaultPads.map((p: any) => p.x))
  expect(maxXDefault - minXDefault).toBeCloseTo(11.275, 4)

  // Explicit padspan sets opposing pad-center span directly (e.g. 11.4mm for IPC-7351 TQFP-64)
  const padSpanSoup = fp
    .string("tqfp64_w10_h10_padspan11.4mm_p0.5mm")
    .circuitJson()
  const padSpanPads = padSpanSoup.filter((el) => el.type === "pcb_smtpad")
  const minXPadSpan = Math.min(...padSpanPads.map((p: any) => p.x))
  const maxXPadSpan = Math.max(...padSpanPads.map((p: any) => p.x))
  const minYPadSpan = Math.min(...padSpanPads.map((p: any) => p.y))
  const maxYPadSpan = Math.max(...padSpanPads.map((p: any) => p.y))
  expect(maxXPadSpan - minXPadSpan).toBeCloseTo(11.4, 6)
  expect(maxYPadSpan - minYPadSpan).toBeCloseTo(11.4, 6)

  // Asymmetric padspanx and padspany set horizontal and vertical pad-center spans independently
  const asymPadSpanSoup = fp
    .string("tqfp64_w10_h12_padspanx11.4mm_padspany13.4mm_p0.5mm")
    .circuitJson()
  const asymPads = asymPadSpanSoup.filter((el) => el.type === "pcb_smtpad")
  const minXAsym = Math.min(...asymPads.map((p: any) => p.x))
  const maxXAsym = Math.max(...asymPads.map((p: any) => p.x))
  const minYAsym = Math.min(...asymPads.map((p: any) => p.y))
  const maxYAsym = Math.max(...asymPads.map((p: any) => p.y))
  expect(maxXAsym - minXAsym).toBeCloseTo(11.4, 6)
  expect(maxYAsym - minYAsym).toBeCloseTo(13.4, 6)

  // Explicit leadspan sets outer pad-tip span (padspan = leadspan - pl)
  const leadSpanSoup = fp
    .string("tqfp64_w10_h10_leadspan12.875mm_p0.5mm")
    .circuitJson()
  const leadSpanPads = leadSpanSoup.filter((el) => el.type === "pcb_smtpad")
  const minXLeadSpan = Math.min(...leadSpanPads.map((p: any) => p.x))
  const maxXLeadSpan = Math.max(...leadSpanPads.map((p: any) => p.x))
  expect(maxXLeadSpan - minXLeadSpan).toBeCloseTo(12.875 - 1.475, 6)

  // Omitting w and h when padspan is provided derives body dimensions automatically
  const padSpanOnly = fp.string("tqfp64_padspan11.4mm_p0.5mm").circuitJson()
  const padSpanOnlyPads = padSpanOnly.filter((el) => el.type === "pcb_smtpad")
  const minXOnly = Math.min(...padSpanOnlyPads.map((p: any) => p.x))
  const maxXOnly = Math.max(...padSpanOnlyPads.map((p: any) => p.x))
  expect(maxXOnly - minXOnly).toBeCloseTo(11.4, 6)
})
