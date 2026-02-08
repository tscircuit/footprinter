import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst_ph", () => {
  const circuitJson = fp.string("jst_ph").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph")
})

test("jst_ph_4", () => {
  const circuitJson = fp.string("jst_ph_4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(4)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph_4")
})

test("jst_ph_6", () => {
  const circuitJson = fp.string("jst_ph_6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(6)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph_6")
})

test("jst_ph3", () => {
  const circuitJson = fp.string("jst_ph3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(3)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph3")
})

test("jst_sh", () => {
  const circuitJson = fp.string("jst_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh")
})

test("jst_sh6", () => {
  const circuitJson = fp.string("jst_sh6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh6")
})

test("jst_sh8", () => {
  const circuitJson = fp.string("jst_sh8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh8")
})
test("jst_sh2", () => {
  const circuitJson = fp.string("jst_sh2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh2")
})
