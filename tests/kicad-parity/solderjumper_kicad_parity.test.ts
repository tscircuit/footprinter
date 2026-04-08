import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/solderjumper", async () => {
  const {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "solderjumper2_p1.3_pw1_ph1.5",
    "Jumper.pretty/SolderJumper-2_P1.3mm_Open_Pad1.0x1.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(0.5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "solderjumper")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "solderjumper_boolean_difference",
  )
})
