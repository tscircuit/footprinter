import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { ssop_def } from "../src/fn/ssop"

test("ssop body dimensions are validated schema fields with typed builder and unit parity", () => {
  const base = "ssop28_p0.65mm_w8.93mm"
  const suffix = "_bodywidth5.3mm_bodyheight10.2mm_bodythickness1.85mm"
  const generated = fp.string(base + suffix)
  expect(generated.json()).toMatchObject({
    bodywidth: 5.3,
    bodyheight: 10.2,
    bodythickness: 1.85,
  })
  const builder = fp()
    .ssop(28)
    .p(0.65)
    .w(8.93)
    .bodywidth(5.3)
    .bodyheight(10.2)
    .bodythickness(1.85)
  expect(builder.circuitJson()).toEqual(generated.circuitJson())
  const parsed = ssop_def.parse({
    fn: "ssop",
    bodywidth: "100mil",
    bodyheight: "0.1in",
    bodythickness: "0.1cm",
  })
  expect(parsed.bodywidth).toBeCloseTo(2.54)
  expect(parsed.bodyheight).toBeCloseTo(2.54)
  expect(parsed.bodythickness).toBeCloseTo(1)
  // Z metadata never moves pads or changes the 2D outline.
  expect(fp.string(base + "_bodythickness1mm").circuitJson()).toEqual(
    fp.string(base).circuitJson(),
  )
  for (const key of ["bodywidth", "bodyheight", "bodythickness"] as const) {
    expect(ssop_def.parse({ fn: "ssop" })[key]).toBeUndefined()
  }
  expect(
    convertCircuitJsonToPcbSvg(generated.circuitJson(), {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "ssop-body-parameters")
})
