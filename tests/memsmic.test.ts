import { expect, test } from "bun:test"
import { pcb_hole, pcb_smtpad, type PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp, getFootprintNames } from "../src/footprinter"
import { memsmic, memsmic_def } from "../src/fn/memsmic"
import { any_footprinter_def } from "../src/helpers/zod/AnyFootprinterDefinitionOutput"
import ics43434 from "./fixtures/ics43434-memsmic-source.json"
import ics43432 from "./fixtures/ics43432-memsmic-source.json"

for (const source of [ics43434, ics43432]) {
  test(`${source.part} profile reproduces manufacturer copper and physical terminals`, () => {
    const circuit = fp.string(source.recipe).circuitJson()
    const pads = circuit.filter(
      (element): element is PcbSmtPad => element.type === "pcb_smtpad",
    )
    const rectangles = pads.filter((pad) => pad.shape === "rect")
    const physicalPins = [
      ...new Set(pads.map((pad) => pad.port_hints?.[0])),
    ].sort()
    const expectedPins = [
      ...source.rectangular_lands.map((land) => land.pin),
      source.annular_land.pin,
    ].sort()
    expect(rectangles).toHaveLength(source.rectangular_lands.length)
    expect(physicalPins).toEqual(expectedPins)
    // Profile-specific signal functions are evidence in the fixture, not aliases
    // imposed on every component using the mechanical footprint.
    for (const pad of pads) expect(pad.port_hints).toHaveLength(1)
    for (const expected of source.rectangular_lands) {
      const actual = rectangles.find(
        (pad) => pad.port_hints?.[0] === expected.pin,
      )!
      expect(actual.x).toBeCloseTo(expected.x, 12)
      expect(actual.y).toBeCloseTo(expected.y, 12)
      expect(actual.width).toBeCloseTo(expected.width, 12)
      expect(actual.height).toBeCloseTo(expected.height, 12)
      expect(pcb_smtpad.parse(actual)).toEqual(actual)
    }
    const ring = pads.filter((pad) => pad.shape === "polygon")
    expect(ring).toHaveLength(4)
    for (const sector of ring) {
      expect(sector.port_hints).toEqual([source.annular_land.pin])
      expect(pcb_smtpad.parse(sector)).toEqual(sector)
      for (const [index, point] of sector.points.entries()) {
        expect(
          Math.hypot(
            point.x - source.annular_land.x,
            point.y - source.annular_land.y,
          ),
        ).toBeCloseTo(
          (index < 33
            ? source.annular_land.outer_diameter
            : source.annular_land.inner_diameter) / 2,
          12,
        )
      }
    }
    const holes = circuit.filter((element) => element.type === "pcb_hole")
    expect(holes).toHaveLength(1)
    expect(holes[0]).toMatchObject({
      hole_shape: "circle",
      hole_diameter: source.acoustic_aperture.minimum_diameter,
      x: source.acoustic_aperture.x,
      y: source.acoustic_aperture.y,
    })
    expect(pcb_hole.parse(holes[0])).toEqual(holes[0]!)
    expect(circuit.some((element) => element.type === "pcb_plated_hole")).toBe(
      false,
    )
    const courtyard = circuit.find(
      (element) => element.type === "pcb_courtyard_outline",
    )!
    expect(Math.max(...courtyard.outline.map((point) => point.x))).toBeCloseTo(
      source.body.width / 2 + 0.25,
      12,
    )
    expect(Math.max(...courtyard.outline.map((point) => point.y))).toBeCloseTo(
      source.body.height / 2 + 0.25,
      12,
    )
    expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
      import.meta.path,
      `memsmic-${source.part.toLowerCase()}-source`,
    )
  })
}

test("both profiles have typed builders and normalized JSON round trips", () => {
  expect(
    fp().memsmic(6).profile("ics43434").holed("0.5mm").circuitJson(),
  ).toEqual(fp.string(ics43434.recipe).circuitJson())
  expect(
    fp().memsmic(7).profile("ics43432").holed("0.5mm").circuitJson(),
  ).toEqual(fp.string(ics43432.recipe).circuitJson())
  for (const source of [ics43434, ics43432]) {
    const normalized = memsmic_def.parse(fp.string(source.recipe).json())
    const parameters = memsmic_def.parse(any_footprinter_def.parse(normalized))
    expect(memsmic_def.parse(parameters)).toEqual(normalized)
    expect(memsmic(parameters).circuitJson).toEqual(
      fp.string(source.recipe).circuitJson(),
    )
    expect(Number(normalized.num_pins)).toBe(source.rectangular_lands.length + 1)
    expect(String(normalized.profile)).toBe(
      source.part.replaceAll("-", "").toLowerCase(),
    )
  }
  expect(getFootprintNames()).toContain("memsmic")
  expect(getFootprintNames()).not.toContain("lgacav")
  expect(getFootprintNames()).not.toContain("union")
})

test("profiles include the required sound opening independently of copper dimensions", () => {
  const base = fp().memsmic(6).profile("ics43434").circuitJson()
  const withHole = fp().memsmic(6).profile("ics43434").holed(0.65).circuitJson()
  expect(base.find((element) => element.type === "pcb_hole")).toMatchObject({
    hole_diameter: 0.5,
  })
  expect(base.filter((element) => element.type === "pcb_smtpad")).toEqual(
    withHole.filter((element) => element.type === "pcb_smtpad"),
  )
  expect(withHole.find((element) => element.type === "pcb_hole")).toMatchObject(
    { hole_diameter: 0.65 },
  )
  expect(convertCircuitJsonToPcbSvg(withHole)).toMatchSvgSnapshot(
    import.meta.path,
    "memsmic-independent-acoustic-opening",
  )
})

test("semantic dimensions scale rows, port and body without a coordinate pad table", () => {
  const circuit = fp()
    .memsmic(6)
    .profile("ics43434")
    .bodywidth(3)
    .bodyheight(4)
    .p(1)
    .py(0.9)
    .pw(0.65)
    .ph(0.5)
    .rowoffsety(-1.5)
    .portoffsetx(0.15)
    .portoffsety(0.8)
    .id(1.1)
    .od(1.8)
    .holed(0.6)
    .circuitJson()
  const rectangles = circuit.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )
  expect(rectangles.find((pad) => pad.port_hints?.[0] === "1")).toMatchObject({
    x: 1,
    y: -1.5,
    width: 0.65,
    height: 0.5,
  })
  const pin2 = rectangles.find((pad) => pad.port_hints?.[0] === "2")!
  expect(pin2.x).toBe(1)
  expect(pin2.y).toBeCloseTo(-0.6, 12)
  expect(circuit.find((element) => element.type === "pcb_hole")).toMatchObject({
    x: 0.15,
    y: 0.8,
    hole_diameter: 0.6,
  })
  const ring = circuit.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "polygon",
  )
  expect(
    Math.max(
      ...ring.flatMap((sector) => sector.points.map((point) => point.x)),
    ),
  ).toBeCloseTo(1.05, 12)
  expect(
    Math.min(
      ...ring.flatMap((sector) => sector.points.map((point) => point.x)),
    ),
  ).toBeCloseTo(-0.75, 12)
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "memsmic-semantic-dimension-variant",
  )
})

test("pin1 rotation and origin move copper, sound opening and courtyard together", () => {
  const circuit = fp()
    .memsmic(6)
    .profile("ics43434")
    .holed(0.5)
    .pin1location("topside", "right")
    .origin("pin1")
    .circuitJson()
  const pin1 = circuit.find(
    (element) =>
      element.type === "pcb_smtpad" && element.port_hints?.[0] === "1",
  )!
  expect(pin1).toMatchObject({
    x: 0,
    y: 0,
    shape: "rotated_rect",
    ccw_rotation: 90,
  })
  const hole = circuit.find((element) => element.type === "pcb_hole")!
  expect(hole.x).toBeCloseTo(-2.074, 12)
  expect(hole.y).toBeCloseTo(-0.9, 12)
  for (const sector of circuit.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "polygon",
  )) {
    for (const point of sector.points) {
      const radius = Math.hypot(point.x - hole.x, point.y - hole.y)
      expect(
        Math.min(Math.abs(radius - 0.8125), Math.abs(radius - 0.5125)),
      ).toBeLessThan(1e-12)
    }
  }
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "memsmic-rotated-pin1-origin",
  )
})

test("reference and silkscreen controls preserve the physical geometry", () => {
  const withReference = fp()
    .memsmic(7)
    .profile("ics43432")
    .holed(0.5)
    .circuitJson()
  const withoutReference = fp()
    .memsmic(7)
    .profile("ics43432")
    .holed(0.5)
    .norefdes()
    .circuitJson()
  const withoutSilkscreen = fp()
    .memsmic(7)
    .profile("ics43432")
    .holed(0.5)
    .nosilkscreen()
    .circuitJson()
  expect(
    withoutReference.find((element) => element.type === "pcb_silkscreen_text"),
  ).toMatchObject({ text: "" })
  expect(
    withoutReference.some((element) => element.type === "pcb_silkscreen_path"),
  ).toBe(true)
  expect(
    withoutSilkscreen.some((element) =>
      element.type.startsWith("pcb_silkscreen"),
    ),
  ).toBe(false)
  const physicalElements = (elements: typeof withReference) =>
    elements.filter((element) => !element.type.startsWith("pcb_silkscreen"))
  expect(physicalElements(withoutReference)).toEqual(
    physicalElements(withReference),
  )
  expect(physicalElements(withoutSilkscreen)).toEqual(
    physicalElements(withReference),
  )
})

test("profiles reject unsupported names, counts, invalid dimensions and copper collisions", () => {
  for (const recipe of [
    "memsmic6",
    "memsmic6_profile(other)",
    "memsmic5_profile(ics43434)",
    "memsmic6_profile(ics43432)",
    "memsmic7_profile(ics43434)",
    "memsmic6_profile(ics43434)_holed0.4",
    "memsmic7_profile(ics43432)_holed0.4",
    "memsmic6_profile(ics43434)_id1.625",
    "memsmic6_profile(ics43434)_holed1.025",
    "memsmic6_profile(ics43434)_p0.6",
    "memsmic6_profile(ics43434)_py0.522",
    "memsmic6_profile(ics43434)_portoffsety-1.364",
    "memsmic6_profile(ics43434)_id1.025_od1.026_holed1.0248",
  ])
    expect(() => fp.string(recipe).circuitJson()).toThrow()
  for (const name of [
    "bodywidth",
    "bodyheight",
    "p",
    "py",
    "pw",
    "ph",
    "id",
    "od",
    "holed",
  ]) {
    for (const value of [0, -1, NaN, Infinity, -Infinity]) {
      expect(
        memsmic_def.safeParse({
          fn: "memsmic",
          profile: "ics43434",
          [name]: value,
        }).success,
      ).toBe(false)
    }
  }
  for (const name of ["rowoffsety", "portoffsetx", "portoffsety"]) {
    for (const value of [NaN, Infinity, -Infinity]) {
      expect(
        memsmic_def.safeParse({
          fn: "memsmic",
          profile: "ics43434",
          [name]: value,
        }).success,
      ).toBe(false)
    }
  }
})
