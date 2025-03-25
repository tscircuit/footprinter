import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnySoupElement, PCBSMTPad } from "circuit-json"

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
  // 16pins, 4mm x 4mm, 8x8 grid, 1.27mm pitch
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga64_w10_h10_grid8x8_p1.27mm",
  )
})

test("bga origin parameters", () => {
  // For a 2x2 grid with pitch=1, the pads should be at:
  // (-0.5, -0.5), (0.5, -0.5)
  // (-0.5, 0.5),  (0.5, 0.5)

  // Test bottom-left origin (pin 1 at bottom-left)
  const soupBl = fp().bga(4).grid("2x2").p(1).blorigin(true).soup()
  const svgContentBl = convertCircuitJsonToPcbSvg(soupBl)
  expect(svgContentBl).toMatchSvgSnapshot(
    import.meta.path,
    "bga_2x2_bottom_left_origin",
  )
  const firstPadBl = soupBl.find(
    (el): el is PCBSMTPad =>
      el.type === "pcb_smtpad" &&
      el.port_hints !== undefined &&
      el.port_hints[0] === "1",
  )
  expect(firstPadBl?.x).toBe(-0.5) // Left column
  expect(firstPadBl?.y).toBe(0.5) // Bottom row

  // Test bottom-right origin (pin 1 at bottom-right)
  const soupBr = fp().bga(4).grid("2x2").p(1).brorigin(true).soup()
  const svgContentBr = convertCircuitJsonToPcbSvg(soupBr)
  expect(svgContentBr).toMatchSvgSnapshot(
    import.meta.path,
    "bga_2x2_bottom_right_origin",
  )
  const firstPadBr = soupBr.find(
    (el): el is PCBSMTPad =>
      el.type === "pcb_smtpad" &&
      el.port_hints !== undefined &&
      el.port_hints[0] === "1",
  )
  expect(firstPadBr?.x).toBe(0.5) // Right column
  expect(firstPadBr?.y).toBe(0.5) // Bottom row

  // Test top-right origin (pin 1 at top-right)
  const soupTr = fp().bga(4).grid("2x2").p(1).trorigin(true).soup()
  const svgContentTr = convertCircuitJsonToPcbSvg(soupTr)
  expect(svgContentTr).toMatchSvgSnapshot(
    import.meta.path,
    "bga_2x2_top_right_origin",
  )
  const firstPadTr = soupTr.find(
    (el): el is PCBSMTPad =>
      el.type === "pcb_smtpad" &&
      el.port_hints !== undefined &&
      el.port_hints[0] === "1",
  )
  expect(firstPadTr?.x).toBe(0.5) // Right column
  expect(firstPadTr?.y).toBe(-0.5) // Top row

  // Test top-left origin (default, pin 1 at top-left)
  const soupTl = fp().bga(4).grid("2x2").p(1).soup()
  const svgContentTl = convertCircuitJsonToPcbSvg(soupTl)
  expect(svgContentTl).toMatchSvgSnapshot(
    import.meta.path,
    "bga_2x2_top_left_origin",
  )
  const firstPadTl = soupTl.find(
    (el): el is PCBSMTPad =>
      el.type === "pcb_smtpad" &&
      el.port_hints !== undefined &&
      el.port_hints[0] === "1",
  )
  expect(firstPadTl?.x).toBe(-0.5) // Left column
  expect(firstPadTl?.y).toBe(-0.5) // Top row

  // Verify that all pads are in the same physical positions regardless of origin
  const allPads = (soup: AnySoupElement[]) =>
    soup
      .filter((el): el is PCBSMTPad => el.type === "pcb_smtpad")
      .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))

  const padsTl = allPads(soupTl)
  const padsBl = allPads(soupBl)
  const padsBr = allPads(soupBr)
  const padsTr = allPads(soupTr)

  // All configurations should have pads in the same physical positions
  for (let i = 0; i < padsTl.length; i++) {
    expect(padsTl[i]!.x).toBe(padsBl[i]!.x)
    expect(padsTl[i]!.y).toBe(padsBl[i]!.y)
    expect(padsTl[i]!.x).toBe(padsBr[i]!.x)
    expect(padsTl[i]!.y).toBe(padsBr[i]!.y)
    expect(padsTl[i]!.x).toBe(padsTr[i]!.x)
    expect(padsTl[i]!.y).toBe(padsTr[i]!.y)
  }
})
