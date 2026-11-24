import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../../src/footprinter"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

// A 52-lead QFP has either a 10 mm body with 0.65 mm pitch or a 14 mm body
// with 1 mm pitch. A footprint string passes "w14" as text, which must select
// the same 14 mm land pattern as fp().qfp(52).w(14).
test("parity/qfp52_w14", async () => {
  // Use the reference land dimensions; this regression concerns the pitch.
  const {
    avgRelDiff,
    courtyardDiffPercent,
    combinedFootprintElements,
    booleanDifferenceSvg,
  } = await compareFootprinterVsKicad(
    "qfp52_w14_pl1.55mm_pw0.6mm",
    "Package_QFP.pretty/LQFP-52_14x14mm_P1mm.circuit.json",
  )

  expect(
    convertCircuitJsonToPcbSvg(combinedFootprintElements, {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "qfp52_w14")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfp52_w14_boolean_difference",
  )

  // A footprint string maps to builder calls, so both forms must agree.
  expect(fp.string("qfp52_w14").circuitJson()).toEqual(
    fp().qfp(52).w(14).circuitJson(),
  )
  expect(avgRelDiff).toBeCloseTo(0, 6)
  expect(courtyardDiffPercent).toBeLessThan(0.5)
})
