import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { lga_def } from "../src/fn/lga"

test("lga body dimensions are validated schema fields with typed builder and unit parity", () => {
  const base = "lga16_grid5x3_p0.5mm_w3.6mm_h3.6mm_pw0.28mm_pl0.8mm"
  const suffix = "_bodywidth3mm_bodyheight3mm_bodythickness1mm"
  const generated = fp.string(base + suffix)
  expect(generated.json()).toMatchObject({
    bodywidth: 3,
    bodyheight: 3,
    bodythickness: 1,
  })
  const builder = fp()
    .lga(16)
    .grid("5x3")
    .p(0.5)
    .w(3.6)
    .h(3.6)
    .pw(0.28)
    .pl(0.8)
    .bodywidth(3)
    .bodyheight(3)
    .bodythickness(1)
  expect(builder.circuitJson()).toEqual(generated.circuitJson())
  const parsed = lga_def.parse({
    fn: "lga",
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
    expect(lga_def.parse({ fn: "lga" })[key]).toBeUndefined()
  }
  expect(
    convertCircuitJsonToPcbSvg(generated.circuitJson(), {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "lga-body-parameters")
})
