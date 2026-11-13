import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPads = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter((e): e is PcbSmtPad => e.type === "pcb_smtpad")

test("sot89_5 numbers the center tab as pin 2, like sot89_3 and KiCad SOT-89-5", () => {
  const pads = getPads("sot89_5")
  const byPin = new Map(pads.map((pad) => [pad.port_hints?.[0], pad] as const))

  // The center lead that joins the exposed tab is pin 2 on SOT-89 packages,
  // as it already is for sot89_3.
  expect(
    getPads("sot89_3").find((p) => p.shape === "polygon")?.port_hints,
  ).toEqual(["2"])
  expect(byPin.get("2")?.shape).toBe("polygon")

  // Outer leads go counter-clockwise from the top-left pad.
  const position = (pin: string) => {
    const pad = byPin.get(pin) as { x: number; y: number }
    return { x: pad.x, y: pad.y }
  }
  expect(position("1")).toEqual({ x: -1.85, y: 1.5 })
  expect(position("3")).toEqual({ x: -1.85, y: -1.5 })
  expect(position("4")).toEqual({ x: 1.85, y: -1.5 })
  expect(position("5")).toEqual({ x: 1.85, y: 1.5 })

  expect(
    convertCircuitJsonToPcbSvg(fp.string("sot89_5").circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "sot89_5-pin-numbering")
})
