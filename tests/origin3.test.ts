import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode bottomleft origin fabrication notes", async () => {
  const original = fp.string("diode0603_cathodepin1").circuitJson()
  const shifted = fp
    .string("diode0603_cathodepin1")
    .origin("bottomleft")
    .circuitJson()
  const originalPad = original.find((el) => el.type === "pcb_smtpad")!
  const shiftedPad = shifted.find((el) => el.type === "pcb_smtpad")!
  const dx = shiftedPad.x - originalPad.x
  const dy = shiftedPad.y - originalPad.y
  const notes = shifted.filter((el) => el.type === "pcb_fabrication_note_text")

  expect(Math.hypot(dx, dy)).toBeGreaterThan(0)
  expect(notes).toHaveLength(2)
  for (const note of notes) {
    const originalNote = original.find(
      (el) => el.type === "pcb_fabrication_note_text" && el.text === note.text,
    )!
    expect(note.anchor_position.x).toBeCloseTo(
      originalNote.anchor_position.x + dx,
      10,
    )
    expect(note.anchor_position.y).toBeCloseTo(
      originalNote.anchor_position.y + dy,
      10,
    )
  }

  await expect(
    convertCircuitJsonToPcbSvg(shifted, { showFabricationNotes: true }),
  ).toMatchSvgSnapshot(import.meta.path, "diode-bottomleft-origin")
})
