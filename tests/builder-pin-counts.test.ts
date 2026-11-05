import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("sot89 builder preserves explicit 3 and 5 pin counts", () => {
  expect(fp().sot89(3).circuitJson()).toEqual(
    fp.string("sot89_3").circuitJson(),
  )
  expect(fp().sot89(5).circuitJson()).toEqual(
    fp.string("sot89_5").circuitJson(),
  )
  const pads5 = fp()
    .sot89(5)
    .circuitJson()
    .filter((el) => el.type === "pcb_smtpad")
  expect(pads5).toHaveLength(5)
})

test("to92 and to92s builders preserve explicit 2 and 3 pin counts", () => {
  expect(fp().to92(2).circuitJson()).toEqual(fp.string("to92_2").circuitJson())
  expect(fp().to92(3).circuitJson()).toEqual(fp.string("to92_3").circuitJson())
  expect(fp().to92s(2).circuitJson()).toEqual(
    fp.string("to92s_2").circuitJson(),
  )
  expect(fp().to92s(3).circuitJson()).toEqual(
    fp.string("to92s_3").circuitJson(),
  )
})

test("potentiometer builder preserves explicit 2 and 3 pin counts", () => {
  expect(fp().potentiometer(2).circuitJson()).toEqual(
    fp.string("potentiometer_2").circuitJson(),
  )
  expect(fp().potentiometer(3).circuitJson()).toEqual(
    fp.string("potentiometer_3").circuitJson(),
  )
})

test("sot343_4 string and builder parse 4 pins in base 10", () => {
  const fromString = fp.string("sot343_4").circuitJson()
  const fromBuilder = fp().sot343(4).circuitJson()
  expect(fromString).toEqual(fp.string("sot343").circuitJson())
  expect(fromBuilder).toEqual(fromString)
  expect(() => fp().sot343(5).circuitJson()).toThrow("Invalid number of pins")
})
