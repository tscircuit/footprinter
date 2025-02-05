import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga footprint", () => {
  const soup = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .missing("center")
    .p(1)
    .soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga footprint")
})

test("bga7_w8_h8_grid3x3_p1_missing(center,B1)", () => {
  const soup = fp
    .string("bga7_w8_h8_grid3x3_p1_missing(center,B1)")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga7_w8_h8_grid3x3_p1_missing(center,B1)",
  )
})

test("bga64_w10_h10_grid8x8_p1.27mm", () => {
  const soup = fp()
    .bga(64)
    .w("10mm")
    .h("10mm")
    .grid("8x8")
    .missing("center")
    .p(1.27)
    .soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga64_w10_h10_grid8x8_p1.27mm",
  )
})

//  Fixed test: Normalize y-values for snapshot comparison
test("bga3x3_inline_snapshot", () => {
  const soup = fp().bga(9).w("4mm").h("4mm").grid("3x3").p(1).soup()

  // Extract pin coordinates
  const pinData = soup
    .filter((item) => item.type === "pcb_smtpad")
    .map(({ x, y, number }) => ({
      x: x.toFixed(2) + "mm",
      y: y.toFixed(2) + "mm",
      number,
    }))

  // Verify the pin data with an inline snapshot
  expect(pinData).toMatchInlineSnapshot(`
[
  {
    "number": undefined,
    "x": "0.00mm",
    "y": "0.00mm",
  },
  {
    "number": undefined,
    "x": "1.00mm",
    "y": "0.00mm",
  },
  {
    "number": undefined,
    "x": "2.00mm",
    "y": "0.00mm",
  },
  {
    "number": undefined,
    "x": "0.00mm",
    "y": "-1.00mm",
  },
  {
    "number": undefined,
    "x": "1.00mm",
    "y": "-1.00mm",
  },
  {
    "number": undefined,
    "x": "2.00mm",
    "y": "-1.00mm",
  },
  {
    "number": undefined,
    "x": "0.00mm",
    "y": "-2.00mm",
  },
  {
    "number": undefined,
    "x": "1.00mm",
    "y": "-2.00mm",
  },
  {
    "number": undefined,
    "x": "2.00mm",
    "y": "-2.00mm",
  },
]
`)
})

test("bga footprint with top-left origin (default)", () => {
  const soup = fp().bga(8).grid("3x3").p(1).soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_tl_origin")
})

test("bga footprint with bottom-left origin", () => {
  const soup = fp().bga(8).grid("3x3").p(1).blorigin(true).soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_bl_origin")
})

test("bga footprint with top-right origin", () => {
  const soup = fp().bga(8).grid("3x3").p(1).trorigin(true).soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_tr_origin")
})

test("bga footprint with bottom-right origin", () => {
  const soup = fp().bga(8).grid("3x3").p(1).brorigin(true).soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "bga_br_origin")
})
