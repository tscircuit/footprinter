import { fp } from "../src/footprinter"
import assert from "assert"

console.log("=== Verifying UTDFN-4-EP(1x1) Footprint ===")

try {
  const circuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()

  // Verify total elements
  console.log(`Total circuit elements: ${circuitJson.length}`)
  console.log("Element types:", circuitJson.map((x) => x.type).join(", "))

  // Filter pads (type is pcb_smtpad, not pcb_pad)
  const pads = circuitJson.filter((x) => x.type === "pcb_smtpad")
  console.log(`Found ${pads.length} pads`)
  assert.strictEqual(
    pads.length,
    5,
    "Should have exactly 5 pads (4 pins + 1 EP)",
  )

  // Find EP pad - it's pin number 5
  const epPad: any = pads.find((x: any) => x.port_hints?.includes("5"))
  assert.ok(epPad, "Pin 5 (Exposed Pad) should exist")
  assert.strictEqual(epPad.x, 0, "EP x coordinate must be 0")
  assert.strictEqual(epPad.y, 0, "EP y coordinate must be 0")
  assert.ok(Math.abs(epPad.width - 0.5) < 0.001, "EP width should be ~0.5mm")
  assert.ok(Math.abs(epPad.height - 0.5) < 0.001, "EP height should be ~0.5mm")

  // Verify regular pads (pins 1 to 4)
  const pad1: any = pads.find((x: any) => x.port_hints?.includes("1"))
  assert.ok(pad1, "Pin 1 should exist")
  console.log(
    "Pad 1 details:",
    JSON.stringify({
      x: pad1.x,
      y: pad1.y,
      width: pad1.width,
      height: pad1.height,
    }),
  )
  // dfn4 width is 1.0mm, pin length pl is 0.3mm.
  // getCcwSoicCoords: widthincludeslegs=true → legsoutside=false → legoffset = -pl/2 = -0.15mm
  // Left side pins: x = -w/2 - legoffset = -0.5 - (-0.15) = -0.35mm
  assert.ok(
    Math.abs(pad1.x - -0.35) < 0.01,
    `Pin 1 x should be ~-0.35mm, got ${pad1.x}`,
  )
  assert.ok(
    Math.abs(pad1.width - 0.3) < 0.01,
    `Pin 1 width should be ~0.3mm, got ${pad1.width}`,
  )
  assert.ok(
    Math.abs(pad1.height - 0.25) < 0.01,
    `Pin 1 height should be ~0.25mm, got ${pad1.height}`,
  )

  // Verify alias parity
  const canonical = fp
    .string(
      "dfn4_w1.00mm_h1.00mm_p0.65mm_pl0.30mm_pw0.25mm_ep_epw0.50mm_eph0.50mm",
    )
    .circuitJson()
  assert.deepStrictEqual(
    circuitJson,
    canonical,
    "Alias 'UTDFN-4-EP(1x1)' must yield identical circuit JSON to canonical representation",
  )

  console.log("\n✅ ALL LOCAL VERIFICATIONS PASSED SUCCESSFULLY!")
} catch (err) {
  console.error("\n❌ VERIFICATION FAILED:")
  console.error(err)
  process.exit(1)
}
