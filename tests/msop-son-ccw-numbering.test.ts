import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("msop and son number pins counter-clockwise (#677)", () => {
  for (const name of ["msop8", "son8", "msop10"]) {
    const pads = fp
      .string(name)
      .circuitJson()
      .filter((el: any) => el.type === "pcb_smtpad") as any[]
    const byPin = (n: string) =>
      pads.find((p) => (p.port_hints ?? []).includes(n))
    const count = pads.length
    const half = count / 2

    // left column runs top -> bottom as pins 1..half
    for (let pin = 1; pin <= half; pin++) {
      const pad = byPin(String(pin))!
      expect(pad.x).toBeLessThan(0)
      if (pin > 1) {
        expect(pad.y).toBeLessThan(byPin(String(pin - 1))!.y)
      }
    }

    // right column runs bottom -> top as pins half+1..count
    for (let pin = half + 1; pin <= count; pin++) {
      const pad = byPin(String(pin))!
      expect(pad.x).toBeGreaterThan(0)
      if (pin > half + 1) {
        expect(pad.y).toBeGreaterThan(byPin(String(pin - 1))!.y)
      }
    }

    // last pin sits across from pin 1
    expect(byPin(String(count))!.y).toBeGreaterThan(0)
  }
})
