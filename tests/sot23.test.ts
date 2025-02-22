import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot23", () => {
  const circuitJson = fp.string("sot23").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23")
})
test("sot23_w3_h1.5_p0.95mm", () => {
  const circuitJson = fp.string("sot23_w3_h1.5_p0.95mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_w3_h1.5_p0.95mm",
  )
})
test("sot23_3", () => {
  const circuitJson = fp.string("sot23_3").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(3)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23_3")
})

test("sot23_5", () => {
  const circuitJson = fp.string("sot23_5").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(5)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23_5")
})

test("sot23_6", () => {
  const circuitJson = fp.string("sot23_6").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(6)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23_6")
})
