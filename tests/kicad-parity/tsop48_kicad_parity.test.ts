import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/tsop48_w18.4_h12.4_p0.5mm", async () => {
  const { avgRelDiff, combinedFootprintElements, booleanDifferenceSvg } =
    await compareFootprinterVsKicad(
      "tsop48_w18.4_h12.4_p0.5mm",
      "Package_SO.pretty/TSOP-I-48_18.4x12mm_P0.5mm.circuit.json",
    )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tsop48_w18.4_h12.4_p0.5mm",
  )
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "tsop48_w18.4_h12.4_p0.5mm_boolean_difference",
  )
})
