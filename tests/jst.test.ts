import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst (default PH, 2 pins)", () => {
  const circuitJson = fp.string("jst").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(2)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst")
})

test("jst3", () => {
  const circuitJson = fp.string("jst3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(3)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst3")
})

test("jst4", () => {
  const circuitJson = fp.string("jst4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(4)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst4")
})

test("jst6", () => {
  const circuitJson = fp.string("jst6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(6)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst6")
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
