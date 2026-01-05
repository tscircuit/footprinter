import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// Test res0402Array2 with custom parameters
test("0402_x2 with default parameters", () => {
  const soup = fp.string("0402_x2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x2_default")
})

test("0402_x2 with custom pw", () => {
  const soup = fp.string("0402_x2_pw0.6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x2_pw0.6")
})

test("0402_x2 with custom ph", () => {
  const soup = fp.string("0402_x2_ph0.5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x2_ph0.5")
})

test("0402_x2 with custom p", () => {
  const soup = fp.string("0402_x2_p0.8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x2_p0.8")
})

test("0402_x2 with custom pw, ph, p", () => {
  const soup = fp.string("0402_x2_pw0.6_ph0.5_p0.8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0402_x2_pw0.6_ph0.5_p0.8",
  )
})

// Test res0402Array4 with custom parameters
test("0402_x4 with default parameters", () => {
  const soup = fp.string("0402_x4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x4_default")
})

test("0402_x4 with custom pw", () => {
  const soup = fp.string("0402_x4_pw0.6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x4_pw0.6")
})

test("0402_x4 with custom ph", () => {
  const soup = fp.string("0402_x4_ph0.4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x4_ph0.4")
})

test("0402_x4 with custom p", () => {
  const soup = fp.string("0402_x4_p0.6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x4_p0.6")
})

test("0402_x4 with custom pw, ph, p", () => {
  const soup = fp.string("0402_x4_pw0.6_ph0.4_p0.6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0402_x4_pw0.6_ph0.4_p0.6",
  )
})

// Test res0603Array2 with custom parameters
test("0603_x2 with default parameters", () => {
  const soup = fp.string("0603_x2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x2_default")
})

test("0603_x2 with custom pw", () => {
  const soup = fp.string("0603_x2_pw1.0").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x2_pw1.0")
})

test("0603_x2 with custom ph", () => {
  const soup = fp.string("0603_x2_ph0.5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x2_ph0.5")
})

test("0603_x2 with custom p", () => {
  const soup = fp.string("0603_x2_p0.9").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x2_p0.9")
})

test("0603_x2 with custom pw, ph, p", () => {
  const soup = fp.string("0603_x2_pw1.0_ph0.5_p0.9").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0603_x2_pw1.0_ph0.5_p0.9",
  )
})

// Test res0603Array4 with custom parameters
test("0603_x4 with default parameters", () => {
  const soup = fp.string("0603_x4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x4_default")
})

test("0603_x4 with custom pw", () => {
  const soup = fp.string("0603_x4_pw1.0").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x4_pw1.0")
})

test("0603_x4 with custom ph", () => {
  const soup = fp.string("0603_x4_ph0.5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x4_ph0.5")
})

test("0603_x4 with custom p", () => {
  const soup = fp.string("0603_x4_p0.9").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x4_p0.9")
})

test("0603_x4 with custom pw, ph, p", () => {
  const soup = fp.string("0603_x4_pw1.0_ph0.5_p0.9").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0603_x4_pw1.0_ph0.5_p0.9",
  )
})

// Test res0606Array2 with custom parameters
test("0606_x2 with default parameters", () => {
  const soup = fp.string("0606_x2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0606_x2_default")
})

test("0606_x2 with custom pw", () => {
  const soup = fp.string("0606_x2_pw0.8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0606_x2_pw0.8")
})

test("0606_x2 with custom ph", () => {
  const soup = fp.string("0606_x2_ph0.7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0606_x2_ph0.7")
})

test("0606_x2 with custom p", () => {
  const soup = fp.string("0606_x2_p1.0").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0606_x2_p1.0")
})

test("0606_x2 with custom pw, ph, p", () => {
  const soup = fp.string("0606_x2_pw0.8_ph0.7_p1.0").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0606_x2_pw0.8_ph0.7_p1.0",
  )
})

// Test res1206Array4 with custom parameters
test("1206_x4 with default parameters", () => {
  const soup = fp.string("1206_x4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206_x4_default")
})

test("1206_x4 with custom pw", () => {
  const soup = fp.string("1206_x4_pw1.0").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206_x4_pw1.0")
})

test("1206_x4 with custom ph", () => {
  const soup = fp.string("1206_x4_ph1.0").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206_x4_ph1.0")
})

test("1206_x4 with custom p", () => {
  const soup = fp.string("1206_x4_p1.5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206_x4_p1.5")
})

test("1206_x4 with custom pw, ph, p", () => {
  const soup = fp.string("1206_x4_pw1.0_ph1.0_p1.5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "1206_x4_pw1.0_ph1.0_p1.5",
  )
})

// Test with textbottom option combined with custom parameters
test("0402_x2 with custom parameters and textbottom", () => {
  const soup = fp.string("0402_x2_pw0.6_ph0.5_p0.8_textbottom").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0402_x2_pw0.6_ph0.5_p0.8_textbottom",
  )
})

test("0603_x4 with custom parameters and textbottom", () => {
  const soup = fp.string("0603_x4_pw1.0_ph0.5_p0.9_textbottom").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0603_x4_pw1.0_ph0.5_p0.9_textbottom",
  )
})
