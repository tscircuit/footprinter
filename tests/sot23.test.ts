import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot23", () => {
  const circuitJson = fp.string("sot23").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23")
})
test("sot23_w3_h1.5_p0.95mm", () => {
  const circuitJson = fp.string("sot23_w3_h1.5_p0.95mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_w3_h1.5_p0.95mm",
  )
})
test("sot23_3", () => {
  const circuitJson = fp.string("sot23_3").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(3)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23_3")
})

test("sot23_3 supports micrometer units", () => {
  const millimeterCircuitJson = fp
    .string("sot23_3_w1.92mm_h2.74mm_p0.95mm_pw0.6mm_pl1.325mm")
    .circuitJson()
  const stringCircuitJson = fp
    .string("sot23_3_w1920um_h2740um_p950um_pw600um_pl1325um")
    .circuitJson()
  const builderCircuitJson = fp()
    .sot23(3)
    .w("1920um")
    .h("2740um")
    .p("950um")
    .pw("600um")
    .pl("1325um")
    .circuitJson()

  expect(stringCircuitJson).toEqual(millimeterCircuitJson)
  expect(builderCircuitJson).toEqual(millimeterCircuitJson)

  const svgContent = convertCircuitJsonToPcbSvg(stringCircuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23_3_micrometer_units",
  )
})

test("compound dimensions support micrometer units", () => {
  const millimeterCircuitJson = fp
    .string("soic8_thermalpad2.4mmx3mm")
    .circuitJson()
  const micrometerCircuitJson = fp
    .string("soic8_thermalpad2400umx3000um")
    .circuitJson()

  expect(micrometerCircuitJson).toEqual(millimeterCircuitJson)

  const svgContent = convertCircuitJsonToPcbSvg(micrometerCircuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_compound_micrometer_units",
  )
})

test("sot23_5", () => {
  const circuitJson = fp.string("sot23_5").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(5)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23_5")
})

test("sot23_6", () => {
  const circuitJson = fp.string("sot23_6").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(6)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23_6")
})

test("sot23_3 draws a silkscreen body outline and pin 1 marker", () => {
  const circuitJson = fp.string("sot23").circuitJson()

  const silkscreenPaths = circuitJson.filter(
    (e) => e.type === "pcb_silkscreen_path",
  )

  // Three broken edges (left split by pins 1/2, right split by pin 3, plus the
  // top and bottom runs) and the pin 1 marker.
  expect(silkscreenPaths.length).toBe(8)
  expect(
    silkscreenPaths.some((p) => p.pcb_silkscreen_path_id === "pin1_indicator"),
  ).toBe(true)
})

test("sot23_3 silkscreen keeps clear of every pad", () => {
  const circuitJson = fp.string("sot23").circuitJson()

  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as any[]
  const silkscreenPaths = circuitJson.filter(
    (e) => e.type === "pcb_silkscreen_path",
  ) as any[]

  const distanceToPad = (point: { x: number; y: number }, pad: any) => {
    const dx = Math.max(
      pad.x - pad.width / 2 - point.x,
      0,
      point.x - (pad.x + pad.width / 2),
    )
    const dy = Math.max(
      pad.y - pad.height / 2 - point.y,
      0,
      point.y - (pad.y + pad.height / 2),
    )
    return Math.sqrt(dx * dx + dy * dy)
  }

  let minClearance = Number.POSITIVE_INFINITY
  for (const path of silkscreenPaths) {
    const strokeHalfWidth = (path.stroke_width ?? 0) / 2
    for (let i = 0; i < path.route.length - 1; i++) {
      const a = path.route[i]
      const b = path.route[i + 1]
      for (let t = 0; t <= 1; t += 0.01) {
        const point = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
        for (const pad of pads) {
          minClearance = Math.min(
            minClearance,
            distanceToPad(point, pad) - strokeHalfWidth,
          )
        }
      }
    }
  }

  // Guard against this passing vacuously if the silkscreen ever disappears.
  expect(silkscreenPaths.length).toBeGreaterThan(0)
  expect(Number.isFinite(minClearance)).toBe(true)

  // IPC silk-to-pad clearance, the same 0.2mm KiCad's SOT-23-3 leaves.
  expect(minClearance).toBeGreaterThanOrEqual(0.2 - 1e-6)
})
