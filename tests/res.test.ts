import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("0402", () => {
  const soup = fp.string("0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402")
})

test("0603", () => {
  const soup = fp.string("0603").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603")
})

test("res01005", () => {
  const soup = fp().res().imperial("01005").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "res01005")
})

test("0201", () => {
  const soup = fp.string("0201").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0201")
})

test("0603_textbottom", () => {
  const soup = fp.string("0603_textbottom").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_textbottom")
})

test("0402_x2", () => {
  const soup = fp.string("0402_x2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x2")
})

test("0402_x4", () => {
  const soup = fp.string("0402_x4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402_x4")
})

test("0603_x2", () => {
  const soup = fp.string("0603_x2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x2")
})

test("0603_x4", () => {
  const soup = fp.string("0603_x4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_x4")
})

test("0606_x2", () => {
  const soup = fp.string("0606_x2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0606_x2")
})

test("1206_x4", () => {
  const soup = fp.string("1206_x4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206_x4")
})

test("custom passive footprints get a derived courtyard", () => {
  const soup = fp().res().p("1.1mm").pw("0.5mm").ph("0.7mm").circuitJson()
  const courtyard = soup.find(
    (element) => element.type === "pcb_courtyard_rect",
  )

  expect(courtyard).toMatchObject({
    type: "pcb_courtyard_rect",
    center: { x: -0.125, y: 0 },
    width: 1.85,
    height: 1.6,
  })
})

test("0402 keeps its authored courtyard", () => {
  const soup = fp.string("0402").circuitJson()
  const courtyard = soup.find(
    (element) => element.type === "pcb_courtyard_rect",
  )

  expect(courtyard).toMatchObject({
    type: "pcb_courtyard_rect",
    width: 1.86,
    height: 0.94,
  })
  expect(courtyard?.center.x).toBeCloseTo(0)
  expect(courtyard?.center.y).toBeCloseTo(0)
})

test("0603 keeps its authored courtyard", () => {
  const soup = fp.string("0603").circuitJson()
  const courtyard = soup.find(
    (element) => element.type === "pcb_courtyard_rect",
  )

  expect(courtyard).toMatchObject({
    type: "pcb_courtyard_rect",
    center: { x: 0, y: 0 },
    width: 2.96,
    height: 1.46,
  })
})
