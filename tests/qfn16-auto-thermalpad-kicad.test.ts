import { expect, test } from "bun:test"
import { any_circuit_element } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { compareFootprinterVsKicad } from "./fixtures/compareFootprinterVsKicad"

test("QFN16 automatic pads have clearance and explicit pads match KiCad copper", async () => {
  const kicadPath =
    "Package_DFN_QFN.pretty/QFN-16-1EP_3x3mm_P0.5mm_EP1.75x1.75mm.circuit.json"
  const response = await fetch(
    `https://kicad-mod-cache.tscircuit.com/${kicadPath}`,
  )
  expect(response.ok).toBe(true)
  const kicadPads = any_circuit_element
    .array()
    .parse(await response.json())
    .filter((element) => element.type === "pcb_smtpad")
  // Preserve the exact automatic-dimension input from PR #894.
  const automaticCircuitJson = fp
    .string("qfn16_w3_h3_p0.5mm_thermalpad")
    .circuitJson()
  expect(convertCircuitJsonToPcbSvg(automaticCircuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "qfn16-auto-thermalpad",
  )
  const automaticPads = automaticCircuitJson.filter(
    (element) => element.type === "pcb_smtpad",
  )
  expect(automaticPads).toHaveLength(17)
  for (const [index, pad] of automaticPads.entries()) {
    if (pad.shape !== "rect") throw new Error("Expected rectangular pad")
    for (const other of automaticPads.slice(index + 1)) {
      if (other.shape !== "rect") throw new Error("Expected rectangular pad")
      const gapX = Math.abs(pad.x - other.x) - (pad.width + other.width) / 2
      const gapY = Math.abs(pad.y - other.y) - (pad.height + other.height) / 2
      expect(Math.max(gapX, gapY)).toBeGreaterThanOrEqual(0.1 - 1e-8)
    }
  }

  // KiCad's 3.7 mm outer copper span plus quad's 0.1 mm inset per edge.
  const footprint =
    "qfn16_w3.9mm_h3.9mm_p0.5mm_pl0.775mm_pw0.25mm_thermalpad1.75x1.75mm"
  const pads = fp
    .string(footprint)
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(17)
  expect(kicadPads).toHaveLength(17)

  for (const pad of pads) {
    let pin = pad.port_hints?.[0]
    if (pin === undefined) throw new Error("Generated pad is missing its pin")
    if (pin === "thermalpad") pin = "17"
    const reference = kicadPads.find((candidate) =>
      candidate.port_hints?.includes(pin),
    )
    if (pad.shape !== "rect" || reference?.shape !== "rect") {
      throw new Error("Expected matching rectangular pads")
    }
    expect(pad.layer).toBe(reference.layer)
    expect(pad.x).toBeCloseTo(reference.x, 8)
    expect(pad.y).toBeCloseTo(reference.y, 8)
    expect(pad.width).toBeCloseTo(reference.width, 8)
    expect(pad.height).toBeCloseTo(reference.height, 8)
    expect(pad.corner_radius ?? 0).toBeCloseTo(reference.corner_radius ?? 0, 8)
  }

  const { avgRelDiff, booleanDifferenceSvg } = await compareFootprinterVsKicad(
    footprint,
    kicadPath,
  )
  expect(avgRelDiff).toBeCloseTo(0, 6)
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "qfn16-auto-thermalpad-kicad",
  )
})
