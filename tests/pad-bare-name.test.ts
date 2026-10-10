import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("bare pad renders a 1mm pad instead of throwing", () => {
  const circuitJson = fp.string("pad").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as Array<{
    width: number
    height: number
  }>

  expect(pads).toHaveLength(1)
  expect(pads[0]!.width).toBe(1)
  expect(pads[0]!.height).toBe(1)
})

test("pad keeps explicit dimensions", () => {
  const circuitJson = fp.string("pad_w2mm_h1mm").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as Array<{
    width: number
    height: number
  }>

  expect(pads).toHaveLength(1)
  expect(pads[0]!.width).toBe(2)
  expect(pads[0]!.height).toBe(1)
})
