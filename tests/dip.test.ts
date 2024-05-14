import test from "ava"
import { fp } from "../src/footprinter"

test("dip", (t) => {
  t.deepEqual(fp().dip(4).w(7.62).params(), {
    dip: 4,
    w: 7.62,
  })
})
