import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

function zoomLeft(svgContent: string): string {
  return svgContent.replace(/<svg([^>]+?)>/, (match, attrs) => {
    const filteredAttrs = attrs
      .replace(/width="[^"]*"/, "")
      .replace(/height="[^"]*"/, "")
    return `<svg${filteredAttrs} width="800" height="600" viewBox="0 230 10 20">`
  })
}

test("dip footprint", () => {
  const soup = fp().dip(4).w(4).p(2).soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip footprint")
})

test("dip8_p1.27mm", () => {
  const soup = fp.string("dip8_p1.27mm").circuitJson()
  let svgContent = convertCircuitJsonToPcbSvg(soup)
  svgContent = zoomLeft(svgContent)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip8_p1.27mm")
})

test("dip16", () => {
  const soup = fp.string("dip16").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip16")
})

test("dip4_w3.00mm", () => {
  const soup = fp.string("dip4_w3.00mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip4_w3.00mm")
})
test("dip10_w4.00mm_p2.65mm", () => {
  const soup = fp.string("dip10_w4.00mm_p2.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "dip10_w4.00mm_p2.65mm",
  )
})
