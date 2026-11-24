import { expect, test } from "bun:test"
import type { PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getLeadPads = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter(
      (e): e is PcbSmtPadRect => e.type === "pcb_smtpad" && e.shape === "rect",
    )
    .filter((pad) => pad.port_hints?.[0] !== "6")
    .sort((a, b) => b.y - a.y)

// TO-252-5 leads are on a 1.14 mm pitch and TO-263-5 leads on a 1.7 mm pitch
// (KiCad TO-252-5_TabPin3 / TO-263-5_TabPin3). The three-lead defaults
// (2.29 mm / 2.54 mm between lead positions) put the five leads far outside
// the package body.
for (const [footprint, pitch, bodyHeight] of [
  ["dpak5", 1.14, 6.5],
  ["to252_5", 1.14, 6.5],
  ["d2pak5", 1.7, 10.1],
  ["to263_5", 1.7, 10.1],
] as const) {
  test(`${footprint} places its five leads on the five-lead pitch`, () => {
    const leads = getLeadPads(footprint)
    expect(leads).toHaveLength(5)

    for (let i = 1; i < leads.length; i++) {
      expect(leads[i - 1]!.y - leads[i]!.y).toBeCloseTo(pitch)
    }

    const leadSpan = leads[0]!.y + leads[0]!.height / 2
    expect(leadSpan).toBeLessThanOrEqual(bodyHeight / 2)
  })
}

test("explicit five-lead pitch and pad width still override the defaults", () => {
  const leads = getLeadPads("dpak6_p1.27mm_pw0.8255mm")
  expect(leads[0]!.y - leads[1]!.y).toBeCloseTo(1.27)
  expect(leads[0]!.height).toBeCloseTo(0.8255)
})

test("five-lead dpak snapshot", () => {
  expect(
    convertCircuitJsonToPcbSvg(fp.string("dpak5").circuitJson(), {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "dpak5-five-lead-pitch")
})
