import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("sot23 draws a body outline and pin-1 marker (#732)", () => {
  const circuitJson = fp.string("sot23").circuitJson()
  const silks = circuitJson.filter(
    (el: any) => el.type === "pcb_silkscreen_path",
  )
  expect(silks.length).toBe(2)

  const ids = silks.map((s: any) => s.pcb_silkscreen_path_id).sort()
  expect(ids).toEqual(["silkscreen_path_body", "silkscreen_path_pin1"])

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads.length).toBe(3)
})
