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
