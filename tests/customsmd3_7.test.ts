import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("customsmd3 has courtyard", () => {
  const circuitJson = fp().customsmd3().circuitJson()
  const courtyard = circuitJson.find(
    (el: any) => el.type === "pcb_courtyard_rect",
  )
  expect(courtyard).toBeDefined()
})
