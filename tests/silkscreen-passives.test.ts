import { expect, test } from "bun:test"
import { fp } from "src/footprinter"

test("0402 0603 0805 produce silkscreen path and text", () => {
  for (const pkg of ["0402", "0603", "0805", "1206"]) {
    const circuit = fp.string(pkg).circuitJson()
    const silkElements = circuit.filter(
      (el: any) => el.type && el.type.startsWith("pcb_silkscreen"),
    )
    expect(
      silkElements.some((el: any) => el.type === "pcb_silkscreen_path"),
    ).toBe(true)
    expect(
      silkElements.some((el: any) => el.type === "pcb_silkscreen_text"),
    ).toBe(true)
  }
})
