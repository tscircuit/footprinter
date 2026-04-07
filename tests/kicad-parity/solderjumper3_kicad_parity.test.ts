import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/solderjumper3", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
    avgRelDiff,
  } = await compareFootprinterVsKicad(
    "solderjumper3_p1.3mm_pw1mm_ph1.5mm",
    "Jumper.pretty/SolderJumper-3_P1.3mm_Open_Pad1.0x1.5mm.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })

  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(avgRelDiff).toBeLessThan(0.01)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "solderjumper3")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "solderjumper3_boolean_difference",
  )
})
