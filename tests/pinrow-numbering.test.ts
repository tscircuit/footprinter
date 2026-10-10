import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { footprinter, fp } from "../src/footprinter"

// Samtec SSW-106-02-G-D: ssw-d.pdf recommended PCB layout (1.04 mm
// drills, 2.54 mm grid), plus ssw-print.pdf p3 Figure 3 -D mating view.
// Copper diameter 1.64 mm provides an explicitly chosen 0.30 mm annulus.
const ssw =
  "pinrow12_rows2_female_pinnumbering(columnmajor)_id1.04_od1.64_nosquareplating_pin1location(bottomside,right)_cyw16.25_cyh5.45"

const pinCenters = (definition: string) =>
  fp
    .string(definition)
    .circuitJson()
    .filter((element) => element.type === "pcb_plated_hole")
    .map((element) => ({
      pin: element.port_hints?.[0],
      x: Number(element.x?.toFixed(6)),
      y: Number(element.y?.toFixed(6)),
    }))

test("column-major numbering represents Samtec double-row female headers", () => {
  const circuitJson = fp.string(ssw).circuitJson()
  const holes = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  expect(holes).toHaveLength(12)
  for (let index = 0; index < 12; index++) {
    expect(holes[index]).toMatchObject({
      shape: "circle",
      hole_diameter: 1.04,
      outer_diameter: 1.64,
      port_hints: [String(index + 1)],
    })
    expect(holes[index]?.x).toBeCloseTo(6.35 - Math.floor(index / 2) * 2.54, 8)
    expect(holes[index]?.y).toBe(index % 2 === 0 ? -1.27 : 1.27)
  }
  const courtyard = circuitJson.find(
    (element) => element.type === "pcb_courtyard_rect",
  )
  expect(courtyard).toMatchObject({ width: 16.25, height: 5.45 })
  expect(courtyard?.center.x).toBeCloseTo(0, 8)
  expect(courtyard?.center.y).toBeCloseTo(0, 8)
  expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "ssw_106_02_g_d")

  expect(
    footprinter()
      .pinrow(12)
      .rows(2)
      .female()
      .pinnumbering("columnmajor")
      .id(1.04)
      .od(1.64)
      .nosquareplating()
      .pin1location("bottomside", "right")
      .cyw(16.25)
      .cyh(5.45)
      .circuitJson(),
  ).toEqual(circuitJson)
})

test("omitting pinnumbering preserves existing two-row spiral geometry", () => {
  const definition = "pinrow12_rows2"
  expect(pinCenters(definition)).toEqual([
    { pin: "1", x: -6.35, y: 1.27 },
    { pin: "2", x: -6.35, y: -1.27 },
    { pin: "3", x: -3.81, y: -1.27 },
    { pin: "4", x: -1.27, y: -1.27 },
    { pin: "5", x: 1.27, y: -1.27 },
    { pin: "6", x: 3.81, y: -1.27 },
    { pin: "7", x: 6.35, y: -1.27 },
    { pin: "8", x: 6.35, y: 1.27 },
    { pin: "9", x: 3.81, y: 1.27 },
    { pin: "10", x: 1.27, y: 1.27 },
    { pin: "11", x: -1.27, y: 1.27 },
    { pin: "12", x: -3.81, y: 1.27 },
  ])
  expect(
    convertCircuitJsonToPcbSvg(fp.string(definition).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "default_spiral")
})

test("column-major sparse headers retain row-major missing positions", () => {
  const definition = "pinrow5_rows2_cols3_missing(2)_pinnumbering(columnmajor)"
  expect(pinCenters(definition)).toEqual([
    { pin: "1", x: -2.54, y: 1.27 },
    { pin: "2", x: -2.54, y: -1.27 },
    { pin: "3", x: 0, y: -1.27 },
    { pin: "4", x: 2.54, y: 1.27 },
    { pin: "5", x: 2.54, y: -1.27 },
  ])
  expect(
    convertCircuitJsonToPcbSvg(fp.string(definition).circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "sparse_columnmajor")
})

test("pinrow numbering validates conventions and complete grids", () => {
  for (const convention of ["ballcoords", "arbitrary"]) {
    expect(() =>
      fp.string(`pinrow12_rows2_pinnumbering(${convention})`).circuitJson(),
    ).toThrow()
  }
  expect(() =>
    fp.string("pinrow5_rows2_pinnumbering(columnmajor)").circuitJson(),
  ).toThrow("Pinrow grid has 6 positions")
  expect(() => fp.string("pinrow6_rows2_pinnumbering").circuitJson()).toThrow()

  // The family-specific fluent type rejects BGA-only ball-coordinate IDs.
  // @ts-expect-error pinrow numbering supports numeric row or column traversal
  footprinter().pinrow(12).pinnumbering("ballcoords")
  footprinter().bga(12).pinnumbering("ballcoords")
})
