import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode pin1 origin fabrication notes", async () => {
  const shifted = fp
    .string("diode0603_cathodepin1")
    .origin("pin1")
    .circuitJson()
  const notes = shifted.filter((el) => el.type === "pcb_fabrication_note_text")

  expect(notes).toHaveLength(2)

  await expect(
    convertCircuitJsonToPcbSvg(shifted, { showFabricationNotes: true }),
  ).toMatchSvgSnapshot(import.meta.path, "diode-pin1-origin")
})
