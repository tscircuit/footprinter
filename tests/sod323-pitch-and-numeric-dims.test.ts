import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("sod323f, sod323fl, and sod323w honor p pitch parameter and numeric dimensions", () => {
  const sod323fCircuit = fp().sod323f().p(3).pl(0.6).pw(0.6).circuitJson()
  const sod323fPads = sod323fCircuit.filter((el) => el.type === "pcb_smtpad")
  expect(sod323fPads).toHaveLength(2)
  expect(sod323fPads[0]!.x).toBeCloseTo(-1.5, 5)
  expect(sod323fPads[1]!.x).toBeCloseTo(1.5, 5)

  const sod323flCircuit = fp.string("sod323fl_p2.8mm").circuitJson()
  const sod323flPads = sod323flCircuit.filter((el) => el.type === "pcb_smtpad")
  expect(sod323flPads).toHaveLength(2)
  expect(sod323flPads[0]!.x).toBeCloseTo(-1.4, 5)
  expect(sod323flPads[1]!.x).toBeCloseTo(1.4, 5)

  const sod323wCircuit = fp().sod323w().p("3.2mm").circuitJson()
  const sod323wPads = sod323wCircuit.filter((el) => el.type === "pcb_smtpad")
  expect(sod323wPads).toHaveLength(2)
  expect(sod323wPads[0]!.x).toBeCloseTo(-1.6, 5)
  expect(sod323wPads[1]!.x).toBeCloseTo(1.6, 5)
})

test("vssop and son accept numeric dimension parameters", () => {
  const vssopCircuit = fp()
    .vssop(8)
    .w(3.06)
    .h(3.14)
    .p(0.65)
    .pl(1.6)
    .pw(0.5)
    .circuitJson()
  const vssopPads = vssopCircuit.filter((el) => el.type === "pcb_smtpad")
  expect(vssopPads).toHaveLength(8)

  const sonCircuit = fp()
    .son(8)
    .w(3)
    .h(3)
    .p(0.5)
    .pl(0.52)
    .pw(0.35)
    .ep()
    .epw(1.4)
    .eph(1.6)
    .circuitJson()
  const sonPads = sonCircuit.filter((el) => el.type === "pcb_smtpad")
  expect(sonPads).toHaveLength(9)
})
