import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// TI TLC555, SLFS043K (January 2026), PDF page 39, D0008A example board layout:
// https://www.ti.com/lit/ds/symlink/tlc555.pdf#page=39
// These are copper LAND dimensions, not package-body or lead-tip dimensions.
// TI gives 5.40 mm row-center spacing, 1.55 x 0.60 mm lands and 1.27 mm pitch.
// This reference is specific to D0008A; it is not a universal SOIC-8 standard.
const tiLands = [
  { pin: "1", x: -2.7, y: 1.905, width: 1.55, height: 0.6 },
  { pin: "2", x: -2.7, y: 0.635, width: 1.55, height: 0.6 },
  { pin: "3", x: -2.7, y: -0.635, width: 1.55, height: 0.6 },
  { pin: "4", x: -2.7, y: -1.905, width: 1.55, height: 0.6 },
  { pin: "5", x: 2.7, y: -1.905, width: 1.55, height: 0.6 },
  { pin: "6", x: 2.7, y: -0.635, width: 1.55, height: 0.6 },
  { pin: "7", x: 2.7, y: 0.635, width: 1.55, height: 0.6 },
  { pin: "8", x: 2.7, y: 1.905, width: 1.55, height: 0.6 },
]

// Without legsoutside, w is the copper outer span: 5.40 + 1.55 = 6.95 mm.
const explicitFootprint = "soic8_w6.95mm_p1.27mm_pl1.55mm_pw0.6mm"
const defaultElements = fp.string("soic8").circuitJson()
const explicitElements = fp.string(explicitFootprint).circuitJson()

function getLands(elements: AnyCircuitElement[]) {
  return elements
    .filter((element) => element.type === "pcb_smtpad")
    .map((pad) => {
      if (pad.shape !== "rect")
        throw new Error("Expected rectangular SOIC lands")
      return {
        pin: pad.port_hints?.[0],
        x: pad.x,
        y: pad.y,
        width: pad.width,
        height: pad.height,
      }
    })
    .sort((a, b) => Number(a.pin) - Number(b.pin))
}

// Compute outside test.failing so setup/shape errors cannot satisfy the repro.
const defaultLands = getLands(defaultElements)
const explicitLands = getLands(explicitElements)

function expectTiLandDimensions(lands: ReturnType<typeof getLands>) {
  expect(lands).toHaveLength(tiLands.length)
  for (let index = 0; index < tiLands.length; index++) {
    const actual = lands[index]!
    const expected = tiLands[index]!
    expect(actual.pin).toBe(expected.pin)
    for (const dimension of ["x", "y", "width", "height"] as const) {
      expect(actual[dimension]).toBeCloseTo(expected[dimension], 6)
    }
  }
}

function comparisonSvg() {
  const panel = (
    lands: ReturnType<typeof getLands>,
    offset: number,
    title: string,
  ) => {
    const rect = (pad: (typeof lands)[number], reference: boolean) =>
      `<rect x="${200 + (pad.x - pad.width / 2) * 45}" y="${205 - (pad.y + pad.height / 2) * 45}" width="${pad.width * 45}" height="${pad.height * 45}" fill="${reference ? "none" : "#c83434"}" fill-opacity="0.8" stroke="${reference ? "#38bdf8" : "none"}" stroke-width="2"/>`
    return `<g transform="translate(${offset},0)">
      <text x="200" y="65" text-anchor="middle" fill="#f5f5f5" font-size="16">${title}</text>
      ${lands.map((pad) => rect(pad, false)).join("")}
      ${tiLands.map((pad) => rect(pad, true)).join("")}
      ${tiLands.map((pad) => `<text x="${200 + (pad.x < 0 ? -4 : 4) * 45}" y="${210 - pad.y * 45}" text-anchor="middle" fill="#e5e7eb" font-size="13">${pad.pin}</text>`).join("")}
    </g>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="370" viewBox="0 0 840 370">
    <rect width="840" height="370" fill="#111827"/>
    <g font-family="Arial, sans-serif">
      <text x="420" y="28" text-anchor="middle" fill="#f5f5f5" font-size="18">SOIC-8 / TI D0008A copper comparison</text>
      ${panel(defaultLands, 10, "Default soic8")}
      ${panel(explicitLands, 430, "Explicit TI land dimensions")}
      <text x="420" y="330" text-anchor="middle" fill="#e5e7eb" font-size="14">Red fill: generated copper | Blue outline: TI reference | Same scale, top view</text>
      <text x="420" y="353" text-anchor="middle" fill="#e5e7eb" font-size="13">TI: 5.40 mm row spacing / 1.55 x 0.60 mm pads / 1.27 mm pitch</text>
    </g>
  </svg>`
}

// Keep snapshot assertions out of test.failing: visual regressions must fail CI.
test("SOIC-8 and TI D0008A land comparison snapshots", () => {
  expect(defaultLands.map((pad) => pad.pin)).toEqual(
    tiLands.map((pad) => pad.pin),
  )
  expect(explicitLands.map((pad) => pad.pin)).toEqual(
    tiLands.map((pad) => pad.pin),
  )
  expect(convertCircuitJsonToPcbSvg(defaultElements)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8-ti-d0008a-default",
  )
  expect(convertCircuitJsonToPcbSvg(explicitElements)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8-ti-d0008a-explicit",
  )
  expect(comparisonSvg()).toMatchSvgSnapshot(
    import.meta.path,
    "soic8-ti-d0008a-overlay",
  )
})

// Expected mismatch: default centers are +/-2.15 mm with 1.00 x 0.60 mm pads.
// This records the D0008A compatibility gap, not a decision to change all SOIC defaults.
// A follow-up can target an explicit package preset and make this a normal test.
test.failing("default soic8 matches TI D0008A land dimensions", () => {
  expectTiLandDimensions(defaultLands)
})

test("explicit soic8 dimensions match all eight TI D0008A lands", () => {
  expectTiLandDimensions(explicitLands)
})
