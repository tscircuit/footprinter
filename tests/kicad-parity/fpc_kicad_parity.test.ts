import { expect, test } from "bun:test"
import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"

// KiCad has no single canonical FPC footprint. Every part in
// Connector_FFC-FPC.pretty is a specific vendor connector (Hirose, Amphenol,
// TE, ...) with its own housing, mounting-pad geometry and courtyard, so the
// usual whole-footprint courtyard-parity assertion does not apply to a bare
// `fpc`. What every 0.5mm 12-pin FFC part does share is the contact land
// pattern: 12 pads on a 0.5mm pitch, 0.3mm wide, centered on the origin. This
// test pins footprinter's default `fpc` contacts to that shared KiCad land
// pattern, using Hirose FH12-12S-0.5SH as the reference, then overlays both for
// a visual snapshot.
//
// It deliberately does not assert courtyard parity. Footprinter draws a
// pad-bounding-box courtyard (11.38 x 4.95mm); the KiCad courtyard encloses the
// connector body (12.12 x 7.9mm). Measured courtyard IoU against the nearest
// KiCad 12-pin 0.5mm parts is 47-59% (diff 41-53%), driven by the housing, which
// footprinter does not model and which differs by vendor.
const KICAD_PATH =
  "Connector_FFC-FPC.pretty/Hirose_FH12-12S-0.5SH_1x12-1MP_P0.50mm_Horizontal.circuit.json"
const KICAD_URL = `https://kicad-mod-cache.tscircuit.com/${KICAD_PATH}`

// Contacts are the narrow pads (<= 1mm wide). The two mounting pads are wider
// (2mm in footprinter, 1.8mm in KiCad) and vendor-specific, so they are excluded.
const contactPads = (elements: any[]): any[] =>
  elements
    .filter((e) => e.type === "pcb_smtpad" && e.width <= 1)
    .sort((a, b) => a.x - b.x)

const pitchOf = (pads: any[]): number =>
  (pads[pads.length - 1].x - pads[0].x) / (pads.length - 1)

test("parity/fpc default contacts match KiCad 0.5mm 12-pin FFC land pattern", async () => {
  const res = await fetch(KICAD_URL)
  expect(res.ok).toBe(true)
  const kicadJson = (await res.json()) as any[]

  const fpcJson = fp.string("fpc").circuitJson() as any[]

  const fpcContacts = contactPads(fpcJson)
  const kicadContacts = contactPads(kicadJson)

  // Same contact count, pitch and pad width as the KiCad land pattern.
  expect(fpcContacts).toHaveLength(12)
  expect(kicadContacts).toHaveLength(12)
  expect(pitchOf(fpcContacts)).toBeCloseTo(0.5, 6)
  expect(pitchOf(fpcContacts)).toBeCloseTo(pitchOf(kicadContacts), 6)

  // Identical contact X positions (both centered on the origin) and pad width.
  fpcContacts.forEach((pad, index) => {
    expect(pad.x).toBeCloseTo(kicadContacts[index]!.x, 6)
    expect(pad.width).toBeCloseTo(kicadContacts[index]!.width, 6)
  })

  // Overlay footprinter (left) against the KiCad reference (shifted right).
  const kicadShifted = transformPcbElements(kicadJson as any, translate(16, 0))
  const svg = convertCircuitJsonToPcbSvg([...fpcJson, ...kicadShifted], {
    showCourtyards: true,
  })
  expect(svg).toMatchSvgSnapshot(import.meta.path, "fpc_default_vs_kicad_fh12")
}, 15000)
