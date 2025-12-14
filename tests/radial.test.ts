import { test } from "bun:test"
import { radial } from "../src/fn/radial"

test("radial footprint", () => {
  const result = radial({
    fn: "radial",
    p: "5mm",
    id: "0.8mm",
    od: "1.6mm",
  })

  // Should have 2 plated holes
  const holes = result.circuitJson.filter((el) => el.type === "pcb_plated_hole")
  if (holes.length !== 2) {
    throw new Error(`Expected 2 holes, got ${holes.length}`)
  }

  // Should have silkscreen line
  const silkscreen = result.circuitJson.filter(
    (el) => el.type === "pcb_silkscreen_path",
  )
  if (silkscreen.length !== 1) {
    throw new Error(`Expected 1 silkscreen path, got ${silkscreen.length}`)
  }

  // Should have reference text
  const refText = result.circuitJson.filter(
    (el) => el.type === "pcb_silkscreen_text",
  )
  if (refText.length !== 1) {
    throw new Error(`Expected 1 reference text, got ${refText.length}`)
  }

  console.log("Radial footprint test passed!")
})
