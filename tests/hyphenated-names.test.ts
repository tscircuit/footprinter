import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

/**
 * Hyphenated package names are the standard format found in datasheets and
 * part catalogs (e.g. SOT-23, TO-220, SOD-123).  The string parser should
 * treat them identically to the concatenated form (sot23, to220, sod123).
 */

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

// ---------------------------------------------------------------------------
// SOT family
// ---------------------------------------------------------------------------
test("sot-23 equals sot23", () => {
  expect(getPadCount(fp.string("sot-23").circuitJson())).toBe(
    getPadCount(fp.string("sot23").circuitJson()),
  )
})

test("sot-23-5 equals sot23_5", () => {
  expect(getPadCount(fp.string("sot-23-5").circuitJson())).toBe(
    getPadCount(fp.string("sot23_5").circuitJson()),
  )
})

test("sot-23-6 equals sot23_6", () => {
  expect(getPadCount(fp.string("sot-23-6").circuitJson())).toBe(
    getPadCount(fp.string("sot23_6").circuitJson()),
  )
})

test("sot-89 equals sot89", () => {
  expect(getPadCount(fp.string("sot-89").circuitJson())).toBe(
    getPadCount(fp.string("sot89").circuitJson()),
  )
})

test("sot-223 equals sot223", () => {
  expect(getPadCount(fp.string("sot-223").circuitJson())).toBe(
    getPadCount(fp.string("sot223").circuitJson()),
  )
})

test("sot-223-5 equals sot223_5", () => {
  expect(getPadCount(fp.string("sot-223-5").circuitJson())).toBe(
    getPadCount(fp.string("sot223_5").circuitJson()),
  )
})

test("sot-323 equals sot323", () => {
  expect(getPadCount(fp.string("sot-323").circuitJson())).toBe(
    getPadCount(fp.string("sot323").circuitJson()),
  )
})

test("sot-363 equals sot363", () => {
  expect(getPadCount(fp.string("sot-363").circuitJson())).toBe(
    getPadCount(fp.string("sot363").circuitJson()),
  )
})

test("sot-563 equals sot563", () => {
  expect(getPadCount(fp.string("sot-563").circuitJson())).toBe(
    getPadCount(fp.string("sot563").circuitJson()),
  )
})

test("sot-723 equals sot723", () => {
  expect(getPadCount(fp.string("sot-723").circuitJson())).toBe(
    getPadCount(fp.string("sot723").circuitJson()),
  )
})

test("sot-886 equals sot886", () => {
  expect(getPadCount(fp.string("sot-886").circuitJson())).toBe(
    getPadCount(fp.string("sot886").circuitJson()),
  )
})

test("sot-963 equals sot963", () => {
  expect(getPadCount(fp.string("sot-963").circuitJson())).toBe(
    getPadCount(fp.string("sot963").circuitJson()),
  )
})

// ---------------------------------------------------------------------------
// TO family
// ---------------------------------------------------------------------------
test("to-92 equals to92", () => {
  expect(getPadCount(fp.string("to-92").circuitJson())).toBe(
    getPadCount(fp.string("to92").circuitJson()),
  )
})

test("to-92-2 equals to92_2", () => {
  expect(getPadCount(fp.string("to-92-2").circuitJson())).toBe(
    getPadCount(fp.string("to92_2").circuitJson()),
  )
})

test("to-220 equals to220", () => {
  expect(getPadCount(fp.string("to-220").circuitJson())).toBe(
    getPadCount(fp.string("to220").circuitJson()),
  )
})

test("to-220f equals to220f", () => {
  expect(getPadCount(fp.string("to-220f").circuitJson())).toBe(
    getPadCount(fp.string("to220f").circuitJson()),
  )
})

test("to-220f-3 equals to220f_3", () => {
  expect(getPadCount(fp.string("to-220f-3").circuitJson())).toBe(
    getPadCount(fp.string("to220f_3").circuitJson()),
  )
})

// ---------------------------------------------------------------------------
// SOD family
// ---------------------------------------------------------------------------
test("sod-123 equals sod123", () => {
  expect(getPadCount(fp.string("sod-123").circuitJson())).toBe(
    getPadCount(fp.string("sod123").circuitJson()),
  )
})

test("sod-323 equals sod323", () => {
  expect(getPadCount(fp.string("sod-323").circuitJson())).toBe(
    getPadCount(fp.string("sod323").circuitJson()),
  )
})

test("sod-523 equals sod523", () => {
  expect(getPadCount(fp.string("sod-523").circuitJson())).toBe(
    getPadCount(fp.string("sod523").circuitJson()),
  )
})

test("sod-80 equals sod80", () => {
  expect(getPadCount(fp.string("sod-80").circuitJson())).toBe(
    getPadCount(fp.string("sod80").circuitJson()),
  )
})

test("sod-882 equals sod882", () => {
  expect(getPadCount(fp.string("sod-882").circuitJson())).toBe(
    getPadCount(fp.string("sod882").circuitJson()),
  )
})

test("sod-923 equals sod923", () => {
  expect(getPadCount(fp.string("sod-923").circuitJson())).toBe(
    getPadCount(fp.string("sod923").circuitJson()),
  )
})

test("sod-110 equals sod110", () => {
  expect(getPadCount(fp.string("sod-110").circuitJson())).toBe(
    getPadCount(fp.string("sod110").circuitJson()),
  )
})

test("sod-128 equals sod128", () => {
  expect(getPadCount(fp.string("sod-128").circuitJson())).toBe(
    getPadCount(fp.string("sod128").circuitJson()),
  )
})

test("sod-123f equals sod123f", () => {
  expect(getPadCount(fp.string("sod-123f").circuitJson())).toBe(
    getPadCount(fp.string("sod123f").circuitJson()),
  )
})

test("sod-323f equals sod323f", () => {
  expect(getPadCount(fp.string("sod-323f").circuitJson())).toBe(
    getPadCount(fp.string("sod323f").circuitJson()),
  )
})

// ---------------------------------------------------------------------------
// IC packages
// ---------------------------------------------------------------------------
test("soic-8 equals soic8", () => {
  expect(getPadCount(fp.string("soic-8").circuitJson())).toBe(
    getPadCount(fp.string("soic8").circuitJson()),
  )
})

test("soic-16 equals soic16", () => {
  expect(getPadCount(fp.string("soic-16").circuitJson())).toBe(
    getPadCount(fp.string("soic16").circuitJson()),
  )
})

test("dip-8 equals dip8", () => {
  expect(getPadCount(fp.string("dip-8").circuitJson())).toBe(
    getPadCount(fp.string("dip8").circuitJson()),
  )
})

test("dip-16 equals dip16", () => {
  expect(getPadCount(fp.string("dip-16").circuitJson())).toBe(
    getPadCount(fp.string("dip16").circuitJson()),
  )
})

test("qfn-32 equals qfn32", () => {
  expect(getPadCount(fp.string("qfn-32").circuitJson())).toBe(
    getPadCount(fp.string("qfn32").circuitJson()),
  )
})

test("qfp-48 equals qfp48", () => {
  expect(getPadCount(fp.string("qfp-48").circuitJson())).toBe(
    getPadCount(fp.string("qfp48").circuitJson()),
  )
})

test("tssop-16 equals tssop16", () => {
  expect(getPadCount(fp.string("tssop-16").circuitJson())).toBe(
    getPadCount(fp.string("tssop16").circuitJson()),
  )
})

test("ssop-8 equals ssop8", () => {
  expect(getPadCount(fp.string("ssop-8").circuitJson())).toBe(
    getPadCount(fp.string("ssop8").circuitJson()),
  )
})

test("lqfp-32 equals lqfp32", () => {
  expect(getPadCount(fp.string("lqfp-32").circuitJson())).toBe(
    getPadCount(fp.string("lqfp32").circuitJson()),
  )
})

test("lqfp-48 equals lqfp48", () => {
  expect(getPadCount(fp.string("lqfp-48").circuitJson())).toBe(
    getPadCount(fp.string("lqfp48").circuitJson()),
  )
})

test("bga-100 equals bga100", () => {
  expect(getPadCount(fp.string("bga-100").circuitJson())).toBe(
    getPadCount(fp.string("bga100").circuitJson()),
  )
})

// ---------------------------------------------------------------------------
// Misc packages
// ---------------------------------------------------------------------------
test("ms-012 equals ms012", () => {
  expect(getPadCount(fp.string("ms-012").circuitJson())).toBe(
    getPadCount(fp.string("ms012").circuitJson()),
  )
})

test("ms-013 equals ms013", () => {
  expect(getPadCount(fp.string("ms-013").circuitJson())).toBe(
    getPadCount(fp.string("ms013").circuitJson()),
  )
})

// ---------------------------------------------------------------------------
// Case insensitivity
// ---------------------------------------------------------------------------
test("SOT-23 (uppercase) equals sot23", () => {
  expect(getPadCount(fp.string("SOT-23").circuitJson())).toBe(
    getPadCount(fp.string("sot23").circuitJson()),
  )
})

test("SOT-223-5 (uppercase) equals sot223_5", () => {
  expect(getPadCount(fp.string("SOT-223-5").circuitJson())).toBe(
    getPadCount(fp.string("sot223_5").circuitJson()),
  )
})

test("TO-92 (uppercase) equals to92", () => {
  expect(getPadCount(fp.string("TO-92").circuitJson())).toBe(
    getPadCount(fp.string("to92").circuitJson()),
  )
})

test("SOD-123 (uppercase) equals sod123", () => {
  expect(getPadCount(fp.string("SOD-123").circuitJson())).toBe(
    getPadCount(fp.string("sod123").circuitJson()),
  )
})

// ---------------------------------------------------------------------------
// Hyphenated with additional parameters (underscore-separated)
// ---------------------------------------------------------------------------
test("soic-8_w5.3mm equals soic8_w5.3mm", () => {
  expect(getPadCount(fp.string("soic-8_w5.3mm").circuitJson())).toBe(
    getPadCount(fp.string("soic8_w5.3mm").circuitJson()),
  )
})

test("dip-8_w7.62mm equals dip8_w7.62mm", () => {
  expect(getPadCount(fp.string("dip-8_w7.62mm").circuitJson())).toBe(
    getPadCount(fp.string("dip8_w7.62mm").circuitJson()),
  )
})
