require("esbuild-register")
const { fp } = require("../src/footprinter")
const assert = require("assert")

console.log("=== Verifying UTDFN-4-EP(1x1) Footprint ===")

try {
  const circuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()

  // Verify total elements
  console.log(`Total circuit elements: ${circuitJson.length}`)

  // Filter pads
  const pads = circuitJson.filter((x) => x.type === "pcb_pad")
  console.log(`Found ${pads.length} pads`)
  assert.strictEqual(
    pads.length,
    5,
    "Should have exactly 5 pads (4 pins + 1 EP)",
  )

  // Verify EP pad (pin 5) is at center (0, 0)
  const epPad = pads.find((x) => x.pcb_pad_id === "5")
  assert.ok(epPad, "Pin 5 (Exposed Pad) should exist")
  assert.strictEqual(epPad.x, 0, "EP x coordinate must be 0")
  assert.strictEqual(epPad.y, 0, "EP y coordinate must be 0")
  assert.strictEqual(epPad.width, 0.5, "EP width should be 0.5mm")
  assert.strictEqual(epPad.height, 0.5, "EP height should be 0.5mm")

  // Verify regular pads (pins 1 to 4)
  const pad1 = pads.find((x) => x.pcb_pad_id === "1")
  assert.ok(pad1, "Pin 1 should exist")
  // dfn4 width is 1.0mm, pin length pl is 0.3mm.
  // getCcwSoicCoords logic: widthincludeslegs is true, so legsoutside is false, so legoffset = -pl/2 = -0.15mm
  // Left side pins (1 & 2): x = -w/2 - legoffset = -0.5 - (-0.15) = -0.35mm.
  assert.strictEqual(
    Math.abs(pad1.x - -0.35) < 0.001,
    true,
    "Pin 1 x coordinate should be -0.35mm",
  )
  assert.strictEqual(pad1.width, 0.3, "Pin 1 width should be 0.3mm")
  assert.strictEqual(pad1.height, 0.25, "Pin 1 height should be 0.25mm")

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
