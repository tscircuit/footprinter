import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/qfn32", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "qfn32_w4_h4_p0.4mm_thermalpad2.65x2.65",
      "Package_DFN_QFN.pretty/QFN-32-1EP_4x4mm_P0.4mm_EP2.65x2.65mm.circuit.json",
    )

  expect(avgRelDiff).toBeLessThan(0.05)
  expect(
    convertCircuitJsonToPcbSvg(combinedFootprintElements),
  ).toMatchSvgSnapshot(import.meta.path, "qfn32_kicad_parity")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_kicad_parity_boolean_diff",
  )
})
