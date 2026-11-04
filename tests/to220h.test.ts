import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// KiCad/kicad-footprints@7ebfa6b23cc292a56f751b7b5f4a0e12eeef69dd,
// Package_TO_SOT_THT.pretty/TO-220-3_Horizontal_Tab{Down,Up}.kicad_mod.
// Translate KiCad x by -2.54 mm and reverse y to circuit-json coordinates.
for (const [orientation, sign] of [
  ["Down", 1],
  ["Up", -1],
] as const) {
  test(`to220h Tab${orientation} reference geometry`, () => {
    const circuit = fp
      .string(`TO-220-3_Horizontal_Tab${orientation}`)
      .circuitJson()
    const pads = circuit.filter((e) => e.type === "pcb_plated_hole")
    expect(pads).toHaveLength(3)
    expect(pads.map((p) => [p.port_hints, p.x, p.y])).toEqual([
      [["1"], -2.54, 0],
      [["2"], 0, 0],
      [["3"], 2.54, 0],
    ])
    expect(pads[0]).toMatchObject({
      shape: "circular_hole_with_rect_pad",
      hole_diameter: 1.1,
      rect_pad_width: 1.905,
      rect_pad_height: 2,
    })
    for (const pad of pads.slice(1)) {
      expect(pad).toMatchObject({
        shape: "pill",
        hole_width: 1.1,
        hole_height: 1.1,
        outer_width: 1.905,
        outer_height: 2,
      })
    }
    const holes = circuit.filter((e) => e.type === "pcb_hole")
    expect(holes).toHaveLength(1)
    expect(holes[0]).toMatchObject({
      hole_shape: "circle",
      hole_diameter: 3.5,
      x: 0,
      y: sign * 16.66,
    })
    expect(holes[0]).not.toHaveProperty("port_hints")
    const court = circuit.find((e) => e.type === "pcb_courtyard_rect")!
    expect(court).toMatchObject({
      width: 10.5,
      height: 20.96,
      center: { x: 0, y: sign * 9.23 },
    })
    const paths = circuit.filter((e) => e.type === "pcb_silkscreen_path")
    expect(paths.some((p) => p.route.every((v) => v.y === sign * 3.69))).toBe(
      true,
    )
    expect(circuit.find((e) => e.type === "pcb_silkscreen_text")).toMatchObject(
      {
        anchor_position: { x: 0, y: sign * 20.58 },
      },
    )
    expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
      import.meta.path,
      `to220h_tab${orientation.toLowerCase()}`,
    )
  })
}

test("to220h canonical, fluent and KiCad aliases agree", () => {
  expect(fp().to220h().circuitJson()).toEqual(fp.string("to220h").circuitJson())
  expect(fp().to220h(3).tabup().circuitJson()).toEqual(
    fp.string("to220h_3_tabup").circuitJson(),
  )
  expect(fp.string("to220h_3").circuitJson()).toEqual(
    fp.string("TO-220-3_Horizontal_TabDown").circuitJson(),
  )
  expect(fp.string("to220h_3_tabup").circuitJson()).toEqual(
    fp.string("TO-220-3_Horizontal_TabUp").circuitJson(),
  )
})

test("unsupported pin counts cannot silently generate a three-pin part", () => {
  for (const name of [
    "to220h_5",
    "to220h_4.5",
    "to220h_-3",
    "to220h_3.5",
    "to220h_0",
    "TO-220-5_Horizontal_TabDown",
  ]) {
    expect(() => fp.string(name).circuitJson()).toThrow(/3 pins/)
  }
})

test("global modifiers preserve the mounting hole", () => {
  const circuit = fp.string("to220h_3_tabup_nosilkscreen").circuitJson()
  expect(circuit.some((e) => e.type.startsWith("pcb_silkscreen"))).toBe(false)
  expect(circuit.filter((e) => e.type === "pcb_hole")).toHaveLength(1)
})
