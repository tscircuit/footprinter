import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("quad16_w4_l4_p0.4_pw0.25_pl0.4", () => {
  const soup = fp.string("quad16_w4_l4_p0.4_pw0.25_pl0.4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad16_w4_l4_p0.4_pw0.25_pl0.4",
  )
})

test("quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)", () => {
  const soup = fp
    .string(
      "quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)",
  )
})

test("quad corner silkscreen keeps clear of every pad", () => {
  // The corner marks sit at (±w/2, ±h/2) — the pad-row centre line — so an arm
  // running inward passes through the band the outer pads occupy. Narrow-body
  // variants like tqfp32_w7 used to draw the mark straight over copper.
  const footprints = [
    "tqfp32_w7",
    "tqfp48_w7",
    "tqfp32",
    "tqfp44",
    "lqfp32",
    "lqfp48",
    "qfn16",
    "qfn32",
    "qfp80_w14_h14_p0.65mm",
  ]

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

  for (const name of footprints) {
    const circuitJson = fp.string(name).circuitJson()
    const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as any[]
    // Only the corner marks; the pin 1 arrow is deliberately placed against the
    // pad it identifies.
    const cornerPaths = circuitJson.filter(
      (e) =>
        e.type === "pcb_silkscreen_path" &&
        /pcb_silkscreen_path_(top|bottom)-(left|right)$/.test(
          (e as any).pcb_silkscreen_path_id ?? "",
        ),
    ) as any[]

    expect(cornerPaths.length).toBeGreaterThan(0)

    let minClearance = Number.POSITIVE_INFINITY
    for (const path of cornerPaths) {
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

    expect(Number.isFinite(minClearance)).toBe(true)
    // IPC silkscreen-to-pad clearance, the same 0.2mm KiCad leaves.
    expect({ name, minClearance: minClearance >= 0.2 - 1e-6 }).toEqual({
      name,
      minClearance: true,
    })
  }
})
