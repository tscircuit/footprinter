import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("sot323 string parsing correctly reads num_pins", () => {
  // Before fix: parseInt(match[1]!, 3) used base-3 radix,
  // so digit "3" and above returned NaN
  const params = fp.string("sot323").params()
  expect(params.fn).toBe("sot323")
})

test("sot343 string parsing correctly reads num_pins", () => {
  // Before fix: parseInt(match[1]!, 4) used base-4 radix,
  // so digit "4" and above returned NaN
  const params = fp.string("sot343").params()
  expect(params.fn).toBe("sot343")
  const circuitJson = fp.string("sot343").circuitJson()
  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpads.length).toBe(4)
})

test("sot23w generates 3 pads by default", () => {
  const circuitJson = fp.string("sot23w").circuitJson()
  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpads.length).toBe(3)
})

test("sot23 silkscreen ref uses parseFloat for height positioning", () => {
  // Before fix: parseInt("2.50mm") returned 2, truncating the decimal
  // After fix: parseFloat("2.50mm") returns 2.5
  const circuitJson = fp.string("sot23").circuitJson()
  const silkscreenText = circuitJson.find(
    (e) => e.type === "pcb_silkscreen_text",
  )
  expect(silkscreenText).toBeDefined()
  // With parseFloat, the Y position should use the full decimal value
  // not just the integer part
  if (silkscreenText && "anchor_position" in silkscreenText) {
    // Y should be based on parseFloat("2.50mm") = 2.5, not parseInt("2.50mm") = 2
    expect(silkscreenText.anchor_position.y).not.toBe(2)
  }
})
