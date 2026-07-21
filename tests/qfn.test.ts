import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("qfn32", () => {
  const soup = fp.string("qfn32").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfn32")
})

test("qfn32_pillpads keeps its thermal pad rectangular", () => {
  const soup = fp.string("qfn32_pillpads_thermalpad3.1x3.1mm").circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  const perimeterPads = pads.filter(
    (pad) => !pad.port_hints.includes("thermalpad"),
  )
  const thermalPad = pads.find((pad) => pad.port_hints.includes("thermalpad"))

  expect(perimeterPads).toHaveLength(32)
  expect(perimeterPads.every((pad) => pad.shape === "pill")).toBe(true)
  expect(
    perimeterPads.every(
      (pad) => pad.radius === Math.min(pad.width, pad.height) / 2,
    ),
  ).toBe(true)
  expect(thermalPad?.shape).toBe("rect")
})
