import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { usba_def } from "../src/fn/usba"
import { any_footprinter_def } from "../src/helpers/zod/AnyFootprinterDefinitionOutput"
import { usbARightAngleCopper } from "./fixtures/usba-rightangle"

test("usba4_tht matches all six Amphenol UE27AC54100 plated holes", () => {
  const circuitJson = fp.string("usba4_tht").circuitJson()
  const holes = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  expect(holes).toHaveLength(6)
  expect(holes.map((hole) => hole.port_hints)).toEqual([
    ["1"],
    ["2"],
    ["3"],
    ["4"],
    ["5"],
    ["6"],
  ])
  for (const { pin, ...expected } of usbARightAngleCopper) {
    expect(holes.find((hole) => hole.port_hints?.includes(pin))).toMatchObject({
      shape: "circle",
      layers: ["top", "bottom"],
      ...expected,
    })
  }
  expect(
    holes
      .slice(0, 4)
      .map((hole, index, contacts) =>
        index === 0 ? 0 : hole.x - contacts[index - 1]!.x,
      )
      .slice(1),
  ).toEqual([2.5, 2, 2.5])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usba4_UE27AC54100",
  )
})

test("usba uses independent pair pitch, center pitch, drill and ring dimensions", () => {
  const circuitJson = fp
    .string(
      "usba4_tht_p3mm_centerp2500um_id1mm_ring0.4mm_shieldspan14mm_shieldy-3mm_shieldid2.4mm_shieldring0.4mm_pinstart11_reverse",
    )
    .circuitJson()
  const holes = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  expect(
    holes.map((hole) => ({ x: hole.x, y: hole.y, pin: hole.port_hints })),
  ).toEqual([
    { x: 4.25, y: 0, pin: ["11"] },
    { x: 1.25, y: 0, pin: ["12"] },
    { x: -1.25, y: 0, pin: ["13"] },
    { x: -4.25, y: 0, pin: ["14"] },
    { x: -7, y: -3, pin: ["15"] },
    { x: 7, y: -3, pin: ["16"] },
  ])
  for (const hole of holes.slice(0, 4))
    expect(hole).toMatchObject({ hole_diameter: 1, outer_diameter: 1.8 })
  for (const hole of holes.slice(4))
    expect(hole).toMatchObject({ hole_diameter: 2.4, outer_diameter: 3.2 })
  expect(
    fp()
      .usba(4)
      .tht()
      .p(3)
      .centerp("2500um")
      .id(1)
      .ring(0.4)
      .shieldspan(14)
      .shieldy(-3)
      .shieldid(2.4)
      .shieldring(0.4)
      .pinstart(11)
      .reverse()
      .circuitJson(),
  ).toEqual(circuitJson)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usba4_semantic_dimensions",
  )
})

test("usba rejects unsupported mount styles, overlapping lands and invalid dimensions", () => {
  for (const invalid of [
    { tht: false },
    { smd: true },
    { num_pins: 9 },
    { pinstart: 0 },
    { p: 0 },
    { centerp: -1 },
    { id: Infinity },
    { shieldy: NaN },
    { ring: 0 },
    { ring: 1 },
    { shieldspan: 2 },
    { bodybottom: 14 },
  ])
    expect(usba_def.safeParse({ fn: "usba", ...invalid }).success).toBe(false)
  expect(() => fp.string("usba4_smd").circuitJson()).toThrow()
  expect(() => fp.string("usba9_tht").circuitJson()).toThrow()
})

test("usba preserves the shell owners when reference and silk are omitted", () => {
  const circuitJson = fp.string("usba4_tht_nosilkscreen").circuitJson()
  expect(
    circuitJson.some((element) => element.type.startsWith("pcb_silkscreen")),
  ).toBe(false)
  expect(
    circuitJson.filter((element) => element.type === "pcb_plated_hole"),
  ).toHaveLength(6)
  expect(
    fp
      .string("usba4_tht_norefdes")
      .circuitJson()
      .some(
        (element) =>
          element.type === "pcb_silkscreen_text" && element.text !== "",
      ),
  ).toBe(false)
})

test("usba definition schema retains all semantic dimensions from json", () => {
  const parameters = fp
    .string(
      "usba4_tht_p3mm_centerp2500um_id1mm_ring0.4mm_shieldspan14mm_shieldy-3mm_shieldid2.4mm_shieldring0.4mm_pinstart11_reverse",
    )
    .json()
  const parsed = any_footprinter_def.parse(parameters)
  expect<unknown>(parsed).toEqual(parameters)
  expect(parsed).toMatchObject({
    fn: "usba",
    num_pins: 4,
    tht: true,
    pinstart: 11,
    reverse: true,
    p: 3,
    centerp: 2.5,
    id: 1,
    ring: 0.4,
    shieldspan: 14,
    shieldy: -3,
    shieldid: 2.4,
    shieldring: 0.4,
  })
})
