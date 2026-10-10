import { expect, test } from "bun:test"
import { pcb_hole, pcb_plated_hole, pcb_smtpad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { PadLayoutCirclePad, PadLayoutSmdPad } from "../src/footprinter"
import { nrfLayout } from "./fixtures/nrf52840-padlayout"

const jsRecipe =
  "padlayout_smdpads(1,-2.5mm,0mm,1.2mm,2.5mm;2,0mm,0mm,1.2mm,2.5mm;3,2.5mm,0mm,1.2mm,2.5mm)_holes(-3.4mm,-2.75mm,0.9mm;3.4mm,-2.75mm,0.9mm)"

const micRecipe =
  "padlayout_smdpads(1,0.9mm,-1.364mm,0.6mm,0.522mm;2,0.9mm,-0.542mm,0.6mm,0.522mm;4,-0.9mm,-0.542mm,0.6mm,0.522mm;5,-0.9mm,-1.364mm,0.6mm,0.522mm;6,0mm,-1.364mm,0.6mm,0.522mm)_rings(3,0mm,0.71mm,1.625mm,1.025mm)_holes(0mm,0.71mm,0.5mm)_bodywidth2.65mm_bodyheight3.5mm"

test("padlayout reproduces the JS102011SAQN reference lands and locators", () => {
  // C&K JS series datasheet, p.4: pads 1.2 x 2.5 on 2.5 pitch;
  // locator spacing 6.8, diameter .9, center 4.0 below the pad's top edge.
  const circuit = fp.string(jsRecipe).circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(pads.map((p) => pcb_smtpad.parse(p))).toMatchObject([
    { port_hints: ["1"], x: -2.5, y: 0, width: 1.2, height: 2.5 },
    { port_hints: ["2"], x: 0, y: 0, width: 1.2, height: 2.5 },
    { port_hints: ["3"], x: 2.5, y: 0, width: 1.2, height: 2.5 },
  ])
  expect(
    circuit.filter((e) => e.type === "pcb_hole").map((p) => pcb_hole.parse(p)),
  ).toMatchObject([
    { hole_shape: "circle", x: -3.4, y: -2.75, hole_diameter: 0.9 },
    { hole_shape: "circle", x: 3.4, y: -2.75, hole_diameter: 0.9 },
  ])
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-js102011saqn")
})

test("padlayout preserves the ICS-43434 copper annulus and separate acoustic hole", () => {
  // InvenSense DS-000069 rev 1.2, pp.10,17,19; Figure 13 rotated to
  // the top-view pinout. The copper opening (1.025) is not the drill (.5).
  const circuit = fp.string(micRecipe).circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  for (const pad of pads) expect(pcb_smtpad.safeParse(pad).success).toBe(true)
  expect(pads.filter((p) => p.shape === "rect")).toMatchObject([
    { port_hints: ["1"], x: 0.9, y: -1.364, width: 0.6, height: 0.522 },
    { port_hints: ["2"], x: 0.9, y: -0.542, width: 0.6, height: 0.522 },
    { port_hints: ["4"], x: -0.9, y: -0.542, width: 0.6, height: 0.522 },
    { port_hints: ["5"], x: -0.9, y: -1.364, width: 0.6, height: 0.522 },
    { port_hints: ["6"], x: 0, y: -1.364, width: 0.6, height: 0.522 },
  ])
  const sectors = pads.filter((p) => p.shape === "polygon")
  expect(sectors).toHaveLength(4)
  let area = 0
  for (const sector of sectors) {
    expect(sector.port_hints).toEqual(["3"])
    if (sector.shape !== "polygon") throw new Error("expected polygon")
    for (const [index, point] of sector.points.entries()) {
      const radius = Math.hypot(point.x, point.y - 0.71)
      expect(radius).toBeCloseTo(index <= 32 ? 1.625 / 2 : 1.025 / 2, 12)
      const next = sector.points[(index + 1) % sector.points.length]!
      area += (point.x * next.y - next.x * point.y) / 2
    }
    // A filled disc would contain this point, inside the copper opening but
    // outside the acoustic drill. All four polygons must leave it copper-free.
    const point = { x: 0.35, y: 0.71 }
    let inside = false
    for (
      let i = 0, j = sector.points.length - 1;
      i < sector.points.length;
      j = i++
    ) {
      const a = sector.points[i]!
      const b = sector.points[j]!
      if (
        a.y > point.y !== b.y > point.y &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
      ) {
        inside = !inside
      }
    }
    expect(inside).toBe(false)
  }
  const exactArea = Math.PI * ((1.625 / 2) ** 2 - (1.025 / 2) ** 2)
  expect(Math.abs(area / exactArea - 1)).toBeLessThan(0.0005)
  const hole = circuit.find((e) => e.type === "pcb_hole")
  expect(pcb_hole.parse(hole)).toMatchObject({
    x: 0,
    y: 0.71,
    hole_shape: "circle",
    hole_diameter: 0.5,
  })
  expect(circuit.some((e) => e.type === "pcb_plated_hole")).toBe(false)
  expect(
    circuit.find((e) => e.type === "pcb_fabrication_note_rect"),
  ).toMatchObject({ center: { x: 0, y: 0 }, width: 2.65, height: 3.5 })
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-ics43434")
})

test("padlayout typed tuple builder preserves string labels and mixed plated shapes", () => {
  const circuit = fp()
    .padlayout()
    .bodywidth(4)
    .bodyheight(3)
    .bodyx(0.5)
    .circlepads([["A2", -1, 1, "300um"]])
    .smdpads([["VSS", 1, 1, 0.5, 0.8]])
    .platedholes([
      ["S1", "circle", -1, -1, 0.8, 0.8, 1.4, 1.4],
      ["S2", "pill", 1, -1, 0.6, 1.5, 1.1, 2],
    ])
    .norefdes()
    .circuitJson()
  expect(
    circuit.find((e) => e.type === "pcb_smtpad" && e.shape === "circle"),
  ).toMatchObject({ port_hints: ["A2"], x: -1, y: 1, radius: 0.15 })
  const plated = circuit.filter((e) => e.type === "pcb_plated_hole")
  for (const hole of plated)
    expect(pcb_plated_hole.safeParse(hole).success).toBe(true)
  expect(plated).toMatchObject([
    {
      port_hints: ["S1"],
      shape: "circle",
      hole_diameter: 0.8,
      outer_diameter: 1.4,
    },
    {
      port_hints: ["S2"],
      shape: "pill",
      hole_width: 0.6,
      hole_height: 1.5,
      outer_width: 1.1,
      outer_height: 2,
    },
  ])
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-mixed-copper")
})

test("padlayout rejects invalid tuples and impossible dimensions", () => {
  const invalid = [
    "padlayout",
    "padlayout_holes(0,0,1)",
    "padlayout_smdpads(1,0,0,1)",
    "padlayout_smdpads(1,0,0,1,1,extra)",
    "padlayout_smdpads(1,0,0,0,1)",
    "padlayout_smdpads(1,0,0,-1,1)",
    "padlayout_smdpads(,0,0,1,1)",
    "padlayout_circlepads(A2,0,0,1)_bodywidth3",
    "padlayout_rings(1,0,0,1,1)",
    "padlayout_rings(1,0,0,1,2)",
    "padlayout_platedholes(1,pill,0,0,1,2,1,3)",
    "padlayout_platedholes(1,circle,0,0,1,2,3,3)",
    // Circuit JSON has no rectangular plated aperture. Never silently emit
    // an oval with the same bounding box or downgrade it to an NPTH.
    "padlayout_platedholes(1,rect,0,0,1,1.6,1.6,2.2)",
  ]
  for (const recipe of invalid)
    expect(() => fp.string(recipe).circuitJson()).toThrow()
  for (const value of [NaN, Infinity, -Infinity]) {
    expect(() =>
      fp()
        .padlayout()
        .smdpads([[1, value, 0, 1, 1]])
        .circuitJson(),
    ).toThrow()
    expect(() =>
      fp()
        .padlayout()
        .circlepads([[1, 0, 0, value]])
        .circuitJson(),
    ).toThrow()
  }
})

test("padlayout origin moves every ring sector and locator together", () => {
  const circuit = fp()
    .padlayout()
    .rings([[1, 2, 3, 2, 1]])
    .holes([[2, 3, 0.5]])
    .origin("pin1")
    .circuitJson()
  expect(circuit.find((e) => e.type === "pcb_hole")).toMatchObject({
    x: 0,
    y: 0,
    hole_diameter: 0.5,
  })
  for (const pad of circuit) {
    if (pad.type !== "pcb_smtpad" || pad.shape !== "polygon") continue
    for (const point of pad.points) {
      const radius = Math.hypot(point.x, point.y)
      expect(
        Math.abs(radius - 1) < 1e-12 || Math.abs(radius - 0.5) < 1e-12,
      ).toBe(true)
    }
  }
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-ring-origin")
})

test("padlayout preserves the nRF52840-QIAA sparse circular terminal layout", () => {
  // Nordic PS v1.1 pp.575/582, reviewed top-view pinout and dimensioned
  // aQFN73 outline. .35 lands cover the .30 maximum terminal diameter;
  // the datasheet gives a package outline, not a recommended land pattern.
  const circuit = fp()
    .padlayout()
    .circlepads(nrfLayout.circlePads as PadLayoutCirclePad[])
    .smdpads([nrfLayout.exposedPad as PadLayoutSmdPad])
    .bodywidth(nrfLayout.bodyWidth)
    .bodyheight(nrfLayout.bodyHeight)
    .circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(74)
  for (const pad of pads) expect(pcb_smtpad.safeParse(pad).success).toBe(true)
  const terminal = (pin: string) =>
    pads.find((p) => p.port_hints?.includes(pin))
  expect(terminal("A8")).toMatchObject({ x: -1.25, y: 3.25, radius: 0.175 })
  expect(terminal("B3")).toMatchObject({ x: -2.5, y: 2.75, radius: 0.175 })
  expect(terminal("C1")).toMatchObject({ x: -3.25, y: 2.25, radius: 0.175 })
  expect(terminal("D2")).toMatchObject({ x: -2.75, y: 2, radius: 0.175 })
  expect(terminal("AD23")).toMatchObject({ x: 2.75, y: -3.25, radius: 0.175 })
  expect(terminal("EP")).toMatchObject({
    x: 0,
    y: 0,
    width: 4.85,
    height: 4.85,
  })
  // e=.5, e1=2.75, e2=.559 (rounded diagonal of .5 by .25).
  expect(Math.hypot(-3.25 + 2.75, 2.25 - 2)).toBeCloseTo(0.559, 3)
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-nrf52840-qiaa")
})

test("padlayout preserves the UE27AC54100 reference circular apertures", () => {
  // Amphenol drawing P-UE27-ACX4-X0X rev H, sheet 1. The source specifies
  // .92/2.30 drills; the .30 annular copper extension is an engineered choice.
  const circuit = fp
    .string(
      "padlayout_platedholes(1,circle,-3.5mm,0mm,0.92mm,0.92mm,1.52mm,1.52mm;2,circle,-1mm,0mm,0.92mm,0.92mm,1.52mm,1.52mm;3,circle,1mm,0mm,0.92mm,0.92mm,1.52mm,1.52mm;4,circle,3.5mm,0mm,0.92mm,0.92mm,1.52mm,1.52mm;5,circle,-6.57mm,-2.71mm,2.3mm,2.3mm,2.9mm,2.9mm;6,circle,6.57mm,-2.71mm,2.3mm,2.3mm,2.9mm,2.9mm)",
    )
    .circuitJson()
  const holes = circuit.filter((e) => e.type === "pcb_plated_hole")
  expect(holes).toHaveLength(6)
  for (const hole of holes)
    expect(pcb_plated_hole.safeParse(hole).success).toBe(true)
  expect(holes).toMatchObject([
    {
      port_hints: ["1"],
      x: -3.5,
      y: 0,
      hole_diameter: 0.92,
      outer_diameter: 1.52,
    },
    {
      port_hints: ["2"],
      x: -1,
      y: 0,
      hole_diameter: 0.92,
      outer_diameter: 1.52,
    },
    {
      port_hints: ["3"],
      x: 1,
      y: 0,
      hole_diameter: 0.92,
      outer_diameter: 1.52,
    },
    {
      port_hints: ["4"],
      x: 3.5,
      y: 0,
      hole_diameter: 0.92,
      outer_diameter: 1.52,
    },
    {
      port_hints: ["5"],
      x: -6.57,
      y: -2.71,
      hole_diameter: 2.3,
      outer_diameter: 2.9,
    },
    {
      port_hints: ["6"],
      x: 6.57,
      y: -2.71,
      hole_diameter: 2.3,
      outer_diameter: 2.9,
    },
  ])
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-ue27ac54100")
})

test("padlayout preserves the 10118194 micro-B contacts and pill apertures", () => {
  // Amphenol 10118194 drawing, p.1. Upper copper and all aperture dimensions
  // follow the reference. Lower copper uses an engineered centered 1 x 1.55
  // pill rather than the factory offset D land; both shell rectangles remain.
  const circuit = fp()
    .padlayout()
    .smdpads([
      [1, -1.3, 2.675, 0.4, 1.35],
      [2, -0.65, 2.675, 0.4, 1.35],
      [3, 0, 2.675, 0.4, 1.35],
      [4, 0.65, 2.675, 0.4, 1.35],
      [5, 1.3, 2.675, 0.4, 1.35],
      [10, -1, 0, 1.5, 1.55],
      [11, 1, 0, 1.5, 1.55],
    ])
    .platedholes([
      [6, "pill", -2.5, 2.7, 0.85, 0.55, 1.25, 0.95],
      [7, "pill", 2.5, 2.7, 0.85, 0.55, 1.25, 0.95],
      [8, "pill", -3.5, 0, 0.5, 1.15, 1, 1.55],
      [9, "pill", 3.5, 0, 0.5, 1.15, 1, 1.55],
    ])
    .circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  const holes = circuit.filter((e) => e.type === "pcb_plated_hole")
  expect(pads).toHaveLength(7)
  expect(holes).toHaveLength(4)
  for (const pad of pads) expect(pcb_smtpad.safeParse(pad).success).toBe(true)
  for (const hole of holes)
    expect(pcb_plated_hole.safeParse(hole).success).toBe(true)
  expect(pads.slice(0, 5).map((p) => ("x" in p ? p.x : undefined))).toEqual([
    -1.3, -0.65, 0, 0.65, 1.3,
  ])
  expect(holes).toMatchObject([
    {
      port_hints: ["6"],
      x: -2.5,
      y: 2.7,
      hole_width: 0.85,
      hole_height: 0.55,
      outer_width: 1.25,
      outer_height: 0.95,
    },
    {
      port_hints: ["7"],
      x: 2.5,
      y: 2.7,
      hole_width: 0.85,
      hole_height: 0.55,
      outer_width: 1.25,
      outer_height: 0.95,
    },
    {
      port_hints: ["8"],
      x: -3.5,
      y: 0,
      hole_width: 0.5,
      hole_height: 1.15,
      outer_width: 1,
      outer_height: 1.55,
    },
    {
      port_hints: ["9"],
      x: 3.5,
      y: 0,
      hole_width: 0.5,
      hole_height: 1.15,
      outer_width: 1,
      outer_height: 1.55,
    },
  ])
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-10118194-micro-b")
})

test("padlayout preserves the DM3AT-SF-PEJM5 asymmetric microSD lands", () => {
  // Hirose DM3AT-SF-PEJM5 2D drawing, p.1, recommended mounting-side
  // layout. Pin1 is the coordinate datum. The hatched regions marked 3
  // are trace keepouts, not additional shell copper lands.
  const circuit = fp()
    .padlayout()
    .smdpads([
      [1, 0, 0, 0.7, 1.2],
      [2, -1.1, 0, 0.7, 1.2],
      [3, -2.2, 0, 0.7, 1.2],
      [4, -3.3, 0, 0.7, 1.2],
      [5, -4.4, 0, 0.7, 1.2],
      [6, -5.5, 0, 0.7, 1.2],
      [7, -6.6, 0, 0.7, 1.2],
      [8, -7.7, 0, 0.7, 1.2],
      [9, -8.65, 0, 0.7, 1.2],
      [10, -9.6, -10.5, 1, 0.8],
      [11, 1.55, 0, 1, 1.2],
      [11, -9.6, -4.3, 1, 1.2],
      [11, -9.6, -14.65, 1, 2.8],
      [11, 3.9, -15.1, 1.3, 1.9],
    ])
    .circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(14)
  expect(new Set(pads.flatMap((p) => p.port_hints ?? [])).size).toBe(11)
  for (const pad of pads) expect(pcb_smtpad.safeParse(pad).success).toBe(true)
  expect(pads.filter((p) => p.port_hints?.includes("11"))).toMatchObject([
    { x: 1.55, y: 0, width: 1, height: 1.2 },
    { x: -9.6, y: -4.3, width: 1, height: 1.2 },
    { x: -9.6, y: -14.65, width: 1, height: 2.8 },
    { x: 3.9, y: -15.1, width: 1.3, height: 1.9 },
  ])
  expect(
    circuit.some((e) => e.type === "pcb_hole" || e.type === "pcb_plated_hole"),
  ).toBe(false)
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-dm3at-microsd")
})
