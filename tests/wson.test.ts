import { expect, test } from "bun:test"
import { footprinter } from "../src/footprinter"

test("wson", () => {
  const fp = footprinter()
    .wson(6)
    .p("0.5mm")
    .w("2mm")
    .h("2mm")
    .pl("0.4mm")
    .pw("0.25mm")
    .ep(true)
    .epw("1.0mm")
    .eph("1.6mm")
  const json = fp.json()

  expect(json).toMatchInlineSnapshot(`
{
  "ep": true,
  "eph": "1.6mm",
  "epw": "1.0mm",
  "fn": "wson",
  "h": "2mm",
  "num_pins": 6,
  "p": "0.5mm",
  "pl": "0.4mm",
  "pw": "0.25mm",
  "w": "2mm",
}
`)

  const soup = fp.soup()
  expect(soup).toMatchSnapshot()
})
