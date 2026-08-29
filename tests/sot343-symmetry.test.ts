import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("sot343 pads are symmetric about the origin (#667)", () => {
  const pads = fp
    .string("sot343")
    .circuitJson()
    .filter((el: any) => el.type === "pcb_smtpad") as any[]

  expect(pads.length).toBe(4)
  const xs = pads.map((p) => p.x)
  const left = xs.filter((x) => x < 0)
  const right = xs.filter((x) => x > 0)

  expect(Math.min(...left)).toBeCloseTo(-Math.min(...right))
  expect(Math.max(...left)).toBeCloseTo(-Math.max(...right))
  // column spacing ~2.1mm for a real SC-70-4
  expect(Math.min(...right) - Math.max(...left)).toBeCloseTo(1.65, 2)
  expect(Math.max(...left)).toBeCloseTo(-0.825, 2)
})
