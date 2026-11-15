import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("repro: default QFN16 thermal pad overlaps perimeter pads", () => {
  const circuitJson = fp.string("qfn16_w3_h3_p0.5mm_thermalpad").circuitJson()
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "qfn16_w3_h3_p0.5mm_thermalpad",
  )
})
