import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot723", () => {
  const soup = fp.string("sot723").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot723")
})

test("sot723 numbers pins like the datasheet: 1 top-left, 2 bottom-left, 3 right", () => {
  const circuitJson = fp.string("sot723").circuitJson() as any[]
  const pad = (pin: string) =>
    circuitJson.find(
      (el) => el.type === "pcb_smtpad" && el.port_hints?.[0] === pin,
    )
  // KiCad SOT-723 (Toshiba datasheet): pins 1 and 2 stack on the left
  // (1 on top), pin 3 sits alone on the right, like sot23/sot323
  expect(pad("1").x).toBeCloseTo(-0.575)
  expect(pad("1").y).toBeCloseTo(0.4)
  expect(pad("2").x).toBeCloseTo(-0.575)
  expect(pad("2").y).toBeCloseTo(-0.4)
  expect(pad("3").x).toBeCloseTo(0.575)
  expect(pad("3").y).toBeCloseTo(0)
})
