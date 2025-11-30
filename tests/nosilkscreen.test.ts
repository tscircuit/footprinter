import { expect, test } from "bun:test"
import { fp } from "src/footprinter"

test("nosilkscreen removes all silkscreen elements", () => {
  const baseFootprint = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .p(1)
    .circuitJson()

  expect(baseFootprint.some((el) => el.type.startsWith("pcb_silkscreen"))).toBe(
    true,
  )

  const noSilkscreenFootprint = fp()
    .bga(8)
    .w("4mm")
    .h("4mm")
    .grid("3x3")
    .p(1)
    .nosilkscreen(true)
    .circuitJson()

  expect(
    noSilkscreenFootprint.some((el) => el.type.startsWith("pcb_silkscreen")),
  ).toBe(false)
})
