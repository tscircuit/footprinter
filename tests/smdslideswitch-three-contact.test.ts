import { expect, test } from "bun:test"
import type { PcbHoleCircle, PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { footprinter, fp } from "../src/footprinter"
import { silkscreenRef } from "../src/helpers/silkscreenRef"

// C&K JS Series datasheet p4, exact JS102011SAQN right-angle SMT layout:
// three 1.2 x 2.5 mm lands at 2.5 mm pitch; two 0.9 mm locating holes
// spaced 6.8 mm, 4.0 mm below pad-top datum (1.25 - 4.0 = -2.75).
const js102011saqn =
  "smdslideswitch3_p2.5_pw1.2_pl2.5_holex3.4_holey-2.75_holed0.9_w9"

test("smdslideswitch3 represents C&K JS102011SAQN without solderable shell pads", () => {
  const circuitJson = fp.string(js102011saqn).circuitJson()
  const pads = circuitJson.filter(
    (element): element is PcbSmtPadRect =>
      element.type === "pcb_smtpad" && element.shape === "rect",
  )
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -2.5, y: 0, width: 1.2, height: 2.5, port_hints: ["1"] },
    { x: 0, y: 0, width: 1.2, height: 2.5, port_hints: ["2"] },
    { x: 2.5, y: 0, width: 1.2, height: 2.5, port_hints: ["3"] },
  ])
  const holes = circuitJson.filter(
    (element): element is PcbHoleCircle =>
      element.type === "pcb_hole" && element.hole_shape === "circle",
  )
  expect(
    holes.map(({ x, y, hole_diameter }) => ({ x, y, hole_diameter })),
  ).toEqual([
    { x: -3.4, y: -2.75, hole_diameter: 0.9 },
    { x: 3.4, y: -2.75, hole_diameter: 0.9 },
  ])
  expect(
    holes.every(
      (element) =>
        element.hole_shape === "circle" && !("port_hints" in element),
    ),
  ).toBe(true)
  expect(
    circuitJson.filter((element) => element.type === "pcb_plated_hole"),
  ).toHaveLength(0)
  const courtyard = circuitJson.find(
    (element) => element.type === "pcb_courtyard_rect",
  )
  expect(courtyard?.width).toBe(9.5)
  if (!courtyard) throw new Error("Missing courtyard")
  for (const element of [...pads, ...holes]) {
    const halfWidth = element.type === "pcb_hole" ? 0.45 : 0.6
    const halfHeight = element.type === "pcb_hole" ? 0.45 : 1.25
    expect(element.x! - halfWidth).toBeGreaterThanOrEqual(
      courtyard.center.x - courtyard.width / 2,
    )
    expect(element.x! + halfWidth).toBeLessThanOrEqual(
      courtyard.center.x + courtyard.width / 2,
    )
    expect(element.y! - halfHeight).toBeGreaterThanOrEqual(
      courtyard.center.y - courtyard.height / 2,
    )
    expect(element.y! + halfHeight).toBeLessThanOrEqual(
      courtyard.center.y + courtyard.height / 2,
    )
  }

  // Fixed test labels make physical contact ownership visible in the snapshot.
  const labels = pads.map((pad, index) => ({
    ...silkscreenRef(pad.x!, pad.y!, 0.25),
    text: String(index + 1),
    pcb_silkscreen_text_id: `contact_${index + 1}`,
  }))
  expect(
    convertCircuitJsonToPcbSvg([...circuitJson, ...labels], {
      showCourtyards: true,
    }),
  ).toMatchSvgSnapshot(import.meta.path, "js102011saqn")
  expect(
    footprinter()
      .smdslideswitch(3)
      .p(2.5)
      .pw(1.2)
      .pl(2.5)
      .holex(3.4)
      .holey(-2.75)
      .holed(0.9)
      .w(9)
      .circuitJson(),
  ).toEqual(circuitJson)

  // Shell dimensions must not produce hidden shell pads or expand a 3-contact footprint.
  expect(
    fp.string(`${js102011saqn}_mpx100_mpy100_mounty100`).circuitJson(),
  ).toEqual(circuitJson)
})

test("three-contact switches support explicit body dimensions without locating holes", () => {
  const circuitJson = footprinter()
    .smdslideswitch(3)
    .p(2.5)
    .pw(1.2)
    .pl(2.5)
    .noholes()
    .w(9)
    .h(3.6)
    .bodyy(-2)
    .circuitJson()
  expect(
    circuitJson.filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(3)
  expect(
    circuitJson.filter((element) => element.type === "pcb_hole"),
  ).toHaveLength(0)
  expect(
    circuitJson.find((element) => element.type === "pcb_courtyard_rect"),
  ).toMatchObject({ width: 9.5, height: 5.55, center: { x: 0, y: -1.275 } })
  expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "three_contact_explicit_body_noholes")
})

test("slide-switch variants reject unsupported pin counts and inconsistent contact grids", () => {
  expect(() => fp.string("smdslideswitch4").circuitJson()).toThrow()
  expect(() => fp.string("smdslideswitch3_signalcols4").circuitJson()).toThrow(
    "needs 3 signal pads",
  )
  expect(() => fp.string("smdslideswitch3_w-1").circuitJson()).toThrow()
  expect(() => fp.string("smdslideswitch3_h0").circuitJson()).toThrow()
})
