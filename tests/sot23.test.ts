import { expect, test } from "bun:test"
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

test("sot23_3 supports micrometer units", () => {
  const millimeterCircuitJson = fp
    .string("sot23_3_w1.92mm_h2.74mm_p0.95mm_pw0.6mm_pl1.325mm")
    .circuitJson()
  const stringCircuitJson = fp
    .string("sot23_3_w1920um_h2740um_p950um_pw600um_pl1325um")
    .circuitJson()
  const builderCircuitJson = fp()
    .sot23(3)
    .w("1920um")
    .h("2740um")
    .p("950um")
    .pw("600um")
    .pl("1325um")
    .circuitJson()

  expect(stringCircuitJson).toEqual(millimeterCircuitJson)
  expect(builderCircuitJson).toEqual(millimeterCircuitJson)

  const svgContent = convertCircuitJsonToPcbSvg(stringCircuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_3_micrometer_units",
  )
})

test("compound dimensions support micrometer units", () => {
  const millimeterCircuitJson = fp
    .string("soic8_thermalpad2.4mmx3mm")
    .circuitJson()
  const micrometerCircuitJson = fp
    .string("soic8_thermalpad2400umx3000um")
    .circuitJson()

  expect(micrometerCircuitJson).toEqual(millimeterCircuitJson)

  const svgContent = convertCircuitJsonToPcbSvg(micrometerCircuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_compound_micrometer_units",
  )
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
