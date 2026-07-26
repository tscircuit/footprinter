import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led2835 creates asymmetric anode/cathode pads matching KiCad LED_PLCC_2835", () => {
  const circuitJson = fp.string("led2835").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(2)
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -0.9, y: 0, width: 2.2, height: 2.2, port_hints: ["1"] },
    { x: 1.375, y: 0, width: 1.25, height: 2.2, port_hints: ["2"] },
  ])

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led2835")
})
