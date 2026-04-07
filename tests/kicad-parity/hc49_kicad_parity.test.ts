import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

test("parity/hc49", async () => {
  const {
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
  } = await compareFootprinterVsKicad(
    "hc49",
    "Crystal.pretty/Crystal_HC49-4H_Vertical.circuit.json",
  )

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  })
  expect(courtyardDiffPercent).toBeLessThan(5)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "hc49")
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "hc49_boolean_difference",
  )
})
