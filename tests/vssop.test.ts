import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("vssop8", () => {
  const circuitJson = fp.string("vssop8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop8")
})

test("vssop8_w4.1mm_h4.14mm_p0.65mm", () => {
  const circuitJson = fp.string("vssop8_w4.1mm_h4.14mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vssop8_w4.1mm_h4.14mm_p0.65mm",
  )
})

test("vssop8_p0.75mm", () => {
  const circuitJson = fp.string("vssop8_p0.75mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop8_p0.75mm")
})

test("vssop8_h4.14mm_pl1.8mm_pw0.8mm_p1mm", () => {
  const circuitJson = fp
    .string("vssop8_h4.14mm_pl1.8mm_pw0.8mm_p1mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vssop8_h4.14mm_pl1.8mm_pw0.8mm_p1mm",
  )
})

test("vssop10", () => {
  const circuitJson = fp.string("vssop10").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop10")
})

test("vssop10_w4.1mm_h4.14mm_p0.5mm", () => {
  const circuitJson = fp.string("vssop10_w4.1mm_h4.14mm_p0.5mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vssop10_w4.1mm_h4.14mm_p0.5mm",
  )
})

test("vssop10_p0.65mm", () => {
  const circuitJson = fp.string("vssop10_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop10_p0.65mm")
})

test("vssop10_h4.4mm_pl1.6mm_pw0.5mm_p0.9mm", () => {
  const circuitJson = fp
    .string("vssop10_h4.4mm_pl1.6mm_pw0.5mm_p0.9mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vssop10_h4.4mm_pl1.6mm_pw0.5mm_p0.9mm",
  )
})

// Invalid test case
test("vssop12", () => {
  try {
    const circuitJson = fp.string("vssop12").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop12")
  } catch (error) {
    const e = error as Error
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toContain("Invalid input")
  }
})

// Invalid test case
test("vssop6", () => {
  try {
    const circuitJson = fp.string("vssop6").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop6")
  } catch (error) {
    const e = error as Error
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toContain("Invalid input")
  }
})

// Invalid test case
test("invalid_vssop6", () => {
  try {
    const circuitJson = fp.string("invalid_vssop6").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "invalid_vssop6")
  } catch (error) {
    const e = error as Error
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toContain("Invalid footprint function")
  }
})

// Invalid test case
test("vssop", () => {
  try {
    const circuitJson = fp.string("vssop6").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vssop6")
  } catch (error) {
    const e = error as Error
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toContain("Invalid input")
  }
})
