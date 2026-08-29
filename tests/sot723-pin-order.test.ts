import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("sot723 numbers pins per the Toshiba datasheet (#686)", () => {
  const circuitJson = fp.string("sot723").circuitJson()
  const pads = circuitJson.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]

  const byPin = (n: string) =>
    pads.find((p) => (p.port_hints ?? []).includes(n))

  expect(byPin("1")).toMatchObject({ x: -0.575, y: 0.4 })
  expect(byPin("2")).toMatchObject({ x: -0.575, y: -0.4 })
  expect(byPin("3")).toMatchObject({ x: 0.575, y: 0 })
})
