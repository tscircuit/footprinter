import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { applyOrigin } from "../src/helpers/apply-origin"
import { applyPin1Location } from "../src/helpers/apply-pin1-location"

// Metadata describes intent; it must survive origin/rotation transforms unchanged.
test("diode artwork explicitly declares polarity without marking ordinary footprints", () => {
  for (const footprint of [
    "diode0402",
    "led0402",
    "led2835",
    "led5050",
    "sod123",
    "sma",
    "smdpads2_p3mm_pw1mm_ph1mm_anodepin1",
    "smdpads2_p3mm_pw1mm_ph1mm_cathodepin1",
  ]) {
    const notes = fp
      .string(footprint)
      .circuitJson()
      .filter(
        (note) =>
          note.type === "pcb_fabrication_note_path" ||
          note.type === "pcb_fabrication_note_text",
      )
    expect(notes.length).toBeGreaterThanOrEqual(6)
    expect(notes.every((note) => note.is_polarity_marking === true)).toBe(true)
  }
  for (const origin of [undefined, "pin1", "bottomleft"] as const) {
    for (const location of [
      ["leftside", "top"],
      ["rightside", "top"],
      ["topside", "left"],
      ["bottomside", "left"],
    ] as const) {
      const circuitJson = applyOrigin(
        applyPin1Location(
          fp.string("smdpads2_p3mm_pw1mm_ph1mm_cathodepin1").circuitJson(),
          [...location],
        ),
        origin,
      )
      const notes = circuitJson.filter(
        (note) =>
          note.type === "pcb_fabrication_note_path" ||
          note.type === "pcb_fabrication_note_text",
      )
      expect(notes).toHaveLength(6)
      expect(notes.every((note) => note.is_polarity_marking === true)).toBe(
        true,
      )
    }
  }

  for (const footprint of [
    "0603",
    "smdpads2_p3mm_pw1mm_ph1mm",
    "smdpads3_anodepin1_cathodepin2",
  ]) {
    expect(
      fp
        .string(footprint)
        .circuitJson()
        .some(
          (note) =>
            "is_polarity_marking" in note && note.is_polarity_marking === true,
        ),
    ).toBe(false)
  }
  const svg = convertCircuitJsonToPcbSvg(
    fp.string("smdpads2_p3mm_pw1mm_ph1mm_cathodepin1").circuitJson(),
    { showFabricationNotes: true, width: 800, height: 600 },
  )
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
