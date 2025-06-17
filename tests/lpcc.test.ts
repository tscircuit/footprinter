import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lpcc32", () => {
  const circuitJson = fp.string("lpcc32").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lpcc32")
})

test("lpcc32_w9mm_h9mm_p1mm", () => {
  const circuitJson = fp.string("lpcc32_w9mm_h9mm_p1mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lpcc32_w9mm_h9mm_p1mm",
  )
})

test("lpcc16_p1.2mm_w5mm_h5mm", () => {
  const circuitJson = fp.string("lpcc16_p1.2mm_w5mm_h5mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lpcc16_p1.2mm_w5mm_h5mm",
  )
})

test("lpcc36_h10mm_pl0.7mm_pw0.4mm_p0.9mm", () => {
  const circuitJson = fp
    .string("lpcc36_h10mm_pl0.7mm_pw0.4mm_p0.9mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lpcc36_h10mm_pl0.7mm_pw0.4mm_p0.9mm",
  )
})

test("lpcc28", () => {
  const circuitJson = fp.string("lpcc28").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lpcc28")
})

// Invalid test case
test("invalid_lpcc", () => {
  try {
    const circuitJson = fp.string("invalid_lpcc").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "invalid_lpcc")
  } catch (error) {
    const e = error as Error
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toContain("Invalid footprint function")
  }
})
