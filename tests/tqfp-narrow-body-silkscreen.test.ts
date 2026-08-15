import { test, expect } from "bun:test"
import { fp } from "../src/index"

test("tqfp32_w7 corner silkscreen clears outermost pads (#734)", () => {
  const elements = fp.string("tqfp32_w7").circuitJson()

  const tlPath = elements.find(
    (e: any) =>
      e.type === "pcb_silkscreen_path" &&
      e.pcb_silkscreen_path_id === "pcb_silkscreen_path_top-left",
  ) as any
  const pad32 = elements.find(
    (e: any) => e.type === "pcb_smtpad" && e.port_hints?.includes("32"),
  ) as any

  expect(tlPath).toBeDefined()
  expect(pad32).toBeDefined()

  // Pad 32 x span: [pad32.x - pad32.width/2, pad32.x + pad32.width/2]
  const pad32Left = pad32.x - pad32.width / 2
  const pad32Right = pad32.x + pad32.width / 2

  // The horizontal arm runs from tlPath.route[0].x to tlPath.route[1].x at y = tlPath.route[0].y
  const armXStart = tlPath.route[0].x

  // Verify the silkscreen arm stops before pad 32 with clearance
  expect(armXStart).toBeLessThan(pad32Left)
})
