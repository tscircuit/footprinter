import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

/** Width of each land along its pin row, i.e. the shorter side of the pad. */
const getPadWidths = (circuitJson: AnyCircuitElement[]) => [
  ...new Set(
    circuitJson.flatMap((element) =>
      element.type === "pcb_smtpad" && element.shape === "rect"
        ? [Math.min(element.width, element.height)]
        : [],
    ),
  ),
]

// The QFP land pattern table behind the qfp defaults (see #62) gives the
// 52-lead 10 mm body (0.65 mm pitch) a 0.45 mm pad and the 14 mm body (1 mm
// pitch) a 0.55 mm pad. qfp has the two widths swapped, which leaves only
// 0.1 mm between the pads of the default qfp52. test.failing until the widths
// follow the table; the fix turns it into a regular test().
test.failing("qfp52 pad widths match the 10 mm and 14 mm land patterns", () => {
  const tenMillimeterBody = fp.string("qfp52").circuitJson()
  const fourteenMillimeterBody = fp().qfp(52).w(14).circuitJson()

  expect(
    convertCircuitJsonToPcbSvg(tenMillimeterBody, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "qfp52-10mm-pad-width")
  expect(
    convertCircuitJsonToPcbSvg(fourteenMillimeterBody, {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "qfp52-14mm-pad-width")

  expect(getPadWidths(tenMillimeterBody)).toEqual([0.45])
  expect(getPadWidths(fourteenMillimeterBody)).toEqual([0.55])
})
