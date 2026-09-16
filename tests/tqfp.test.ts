import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm", () => {
  const soup = fp.string("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp64_w10_p0.5mm_pw0.3_pl1.475mm",
  )
})

test("tqfp32_w7", () => {
  const soup = fp.string("tqfp32_w7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp32_w7")
})

test("tqfp44_w10", () => {
  const soup = fp.string("tqfp44_w10").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp44_w10")
})

test("tqfp48_w7", () => {
  const soup = fp.string("tqfp48_w7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp48_w7")
})

test("tqfp100_w14", () => {
  const soup = fp.string("tqfp100_w14").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp100_w14")
})

test("tqfp44 uses standard 0.8mm pitch and 0.55mm pad width (JEDEC MS-026 BBA)", () => {
  const soup = fp.string("tqfp44").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad") as any[]
  expect(pads).toHaveLength(44)
  // Pin 1 on left side: pad length (width) is 1.475mm, pad width (height) is 0.55mm
  expect(pads[0].width).toBeCloseTo(1.475, 3)
  expect(pads[0].height).toBeCloseTo(0.55, 2)

  // Distance between neighboring pads (pin 1 and pin 2 along Y) should be 0.8mm pitch
  const pitch = Math.abs(pads[0].y - pads[1].y)
  expect(pitch).toBeCloseTo(0.8, 3)
})
