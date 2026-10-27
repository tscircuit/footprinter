import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode pin1 origin retains footprint geometry without automatic polarity artwork", async () => {
  const original = fp.string("diode0603_cathodepin1").circuitJson()
  const shifted = fp
    .string("diode0603_cathodepin1")
    .origin("pin1")
    .circuitJson()
  const originalPad = original.find((el) => el.type === "pcb_smtpad")!
  const shiftedPad = shifted.find((el) => el.type === "pcb_smtpad")!
  const dx = shiftedPad.x - originalPad.x
  const dy = shiftedPad.y - originalPad.y
  const pads = shifted.filter((el) => el.type === "pcb_smtpad")
  expect(Math.hypot(dx, dy)).toBeGreaterThan(0)
  expect(pads).toHaveLength(2)
  for (const pad of pads) {
    const originalPad = original.find(
      (el) =>
        el.type === "pcb_smtpad" && el.port_hints?.[0] === pad.port_hints?.[0],
    )!
    expect(pad.x).toBeCloseTo(originalPad.x + dx, 10)
    expect(pad.y).toBeCloseTo(originalPad.y + dy, 10)
  }
  expect(
    shifted.filter(
      (el) =>
        el.type === "pcb_fabrication_note_path" ||
        el.type === "pcb_fabrication_note_text",
    ),
  ).toHaveLength(0)

  await expect(
    convertCircuitJsonToPcbSvg(shifted, { showFabricationNotes: true }),
  ).toMatchSvgSnapshot(import.meta.path, "diode-pin1-origin")
})
