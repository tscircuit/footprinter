import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("two generic pads honor explicitly declared diode polarity", () => {
  // This is the string core produces for the board's cathode-first diode.
  const circuitJson = fp
    .string("smdpads2_p3.3848mm_pw0.95mm_ph1.15mm_anodepin2_cathodepin1")
    .circuitJson()
  const svgOptions = { width: 800, height: 600, showFabricationNotes: true }
  expect(
    convertCircuitJsonToPcbSvg(
      [
        ...circuitJson,
        {
          type: "pcb_note_text",
          pcb_note_text_id: "expected_polarity",
          text: "Expected: cathode (-) left, anode (+) right",
          anchor_position: { x: 0, y: -1.5 },
          anchor_alignment: "center",
          font: "tscircuit2024",
          font_size: 0.2,
          layer: "top",
        },
      ],
      svgOptions,
    ),
  ).toMatchSvgSnapshot(import.meta.path)
  expect(
    circuitJson.filter(
      (element) => element.type === "pcb_fabrication_note_path",
    ),
  ).toHaveLength(4)
  expect(
    circuitJson
      .filter((element) => element.type === "pcb_fabrication_note_text")
      .map((note) => note.text)
      .sort(),
  ).toEqual(["+", "-"])
})
