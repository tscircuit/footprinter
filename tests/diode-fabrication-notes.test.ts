import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

const diodeLikeFootprints = [
  "diode0402",
  "led0402",
  "led2835",
  "led5050",
  "melf",
  "micromelf",
  "minimelf",
  "sma",
  "smb",
  "smbf",
  "smc",
  "smf",
  "sod110",
  "sod123",
  "sod123f",
  "sod123fl",
  "sod123w",
  "sod128",
  "sod323",
  "sod323f",
  "sod323fl",
  "sod323w",
  "sod523",
  "sod723",
  "sod80",
  "sod882",
  "sod882d",
  "sod923",
]

test.each(diodeLikeFootprints)(
  "%s includes a diode symbol in its fabrication notes",
  (footprintName) => {
    const circuitJson = fp.string(footprintName).circuitJson()
    const fabricationNoteIds = circuitJson.flatMap((element) =>
      element.type === "pcb_fabrication_note_path"
        ? [element.pcb_fabrication_note_path_id]
        : [],
    )

    expect(
      fabricationNoteIds.some((id) =>
        id.startsWith("diode_fabrication_note_triangle"),
      ),
    ).toBeTrue()
    expect(
      fabricationNoteIds.some((id) =>
        id.startsWith("diode_fabrication_note_cathode"),
      ),
    ).toBeTrue()
  },
)
