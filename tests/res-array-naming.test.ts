import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("resistor array with 'x' naming (e.g. 1206x4)", () => {
  const soup = fp.string("1206x4").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(8)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "1206x4")
})

test("0402x2", () => {
  const soup = fp.string("0402x2").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(4)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0402x2")
})

test("0606x2", () => {
  const soup = fp.string("0606x2").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(4)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0606x2")
})

test("0603x4", () => {
  const soup = fp.string("0603x4").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(8)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603x4")
})

test("0603x4 supports the wider end terminals used by C29718", () => {
  const soup = fp
    .string(
      "0603x4_p0.8mm_pw0.8mm_ph0.5mm_columnpitch1.6mm_outerpadheight0.65mm",
    )
    .circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const endPads = pads.filter((pad) => Math.abs(pad.y) > 1)
  const innerPads = pads.filter((pad) => Math.abs(pad.y) < 1)

  expect(pads).toHaveLength(8)
  expect(endPads).toHaveLength(4)
  expect(endPads.every((pad) => pad.height === 0.65)).toBe(true)
  expect(innerPads.every((pad) => pad.height === 0.5)).toBe(true)

  expect(convertCircuitJsonToPcbSvg(soup)).toMatchSvgSnapshot(
    import.meta.path,
    "0603x4_c29718_wider_end_terminals",
  )
})
