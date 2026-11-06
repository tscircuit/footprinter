import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("customsmd3 default layout (1 left, 2 top-right, 3 bottom-right)", () => {
  const circuitJson = fp().customsmd3().circuitJson()
  const pads = circuitJson.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]
  expect(pads).toHaveLength(3)

  const pin1 = pads.find((p) => p.port_hints?.includes("1"))!
  const pin2 = pads.find((p) => p.port_hints?.includes("2"))!
  const pin3 = pads.find((p) => p.port_hints?.includes("3"))!

  expect(pin1.x).toBeLessThan(pin2.x)
  expect(pin1.x).toBeLessThan(pin3.x)
  expect(pin2.y).toBeGreaterThan(pin3.y)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "customsmd3_default")
})

test("customsmd3 circular pads and position/distance specifiers", () => {
  const circleCircuitJson = fp().customsmd3().r("0.5mm").circuitJson()
  const circlePads = circleCircuitJson.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]
  expect(circlePads).toHaveLength(3)
  for (const pad of circlePads) {
    expect(pad.shape).toBe("circle")
    expect(pad.radius).toBeCloseTo(0.5)
  }

  const reorderedJson = fp()
    .customsmd3()
    .leftmostn(2)
    .topmostn(1)
    .bottommostn(3)
    .c2cvert_1_3("2mm")
    .e2ehorz_1_2("3mm")
    .w("1.5mm")
    .h("1mm")
    .circuitJson()
  const reorderedPads = reorderedJson.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]
  const pin1 = reorderedPads.find((p) => p.port_hints?.includes("1"))!
  const pin2 = reorderedPads.find((p) => p.port_hints?.includes("2"))!
  const pin3 = reorderedPads.find((p) => p.port_hints?.includes("3"))!

  expect(pin2.x).toBeLessThan(pin1.x)
  expect(Math.abs(pin1.y - pin3.y)).toBeCloseTo(2)
  expect(Math.abs(pin1.x - pin2.x) - pin1.width).toBeCloseTo(3)

  const stringJson = fp.string("customsmd3_w2_h1").circuitJson()
  const stringPads = stringJson.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]
  expect(stringPads).toHaveLength(3)
  expect(stringPads[0].width).toBeCloseTo(2)
  expect(stringPads[0].height).toBeCloseTo(1)
})
