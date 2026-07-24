import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led5050 creates 6 pads matching the KiCad LED_RGB_5050-6 land pattern", () => {
  const circuitJson = fp.string("led5050").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(6)
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -2.4, y: 1.7, width: 2, height: 1.1, port_hints: ["1"] },
    { x: 2.4, y: 1.7, width: 2, height: 1.1, port_hints: ["6"] },
    { x: -2.4, y: 0, width: 2, height: 1.1, port_hints: ["2"] },
    { x: 2.4, y: 0, width: 2, height: 1.1, port_hints: ["5"] },
    { x: -2.4, y: -1.7, width: 2, height: 1.1, port_hints: ["3"] },
    { x: 2.4, y: -1.7, width: 2, height: 1.1, port_hints: ["4"] },
  ])

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led5050")
})

test("led5050 supports parameter overrides", () => {
  const circuitJson = fp.string("led5050_rowspan5mm_p1.6mm").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(6)
  const pad1 = pads.find((p) => p.port_hints?.includes("1"))
  expect(pad1?.x).toBe(-2.5)
  expect(pad1?.y).toBe(1.6)
})
