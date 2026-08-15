import { test, expect } from "bun:test"
import { fp } from "../src/index"

test("sot23 (3-pin) generates silkscreen body outline and pin 1 indicator (#732)", () => {
  const elements = fp.string("sot23").circuitJson()

  const silkscreenPaths = elements.filter(
    (e: any) => e.type === "pcb_silkscreen_path",
  ) as Array<any>

  expect(silkscreenPaths.length).toBeGreaterThanOrEqual(3)

  const pin1Indicator = silkscreenPaths.find(
    (p) => p.pcb_silkscreen_path_id === "pin1_indicator",
  )
  expect(pin1Indicator).toBeDefined()
  expect(pin1Indicator.route.length).toBe(4)
})
