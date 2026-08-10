import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("diode0603_tht string produces through-hole pads", () => {
  const soup = fp.string("diode0603_tht").circuitJson()
  const holes = soup.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes).toHaveLength(2)
})
