import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { base_quad_def, quad, quad_def } from "../src/fn/quad"

test("quad rejects explicit zero or negative pitch across quad-family footprints", () => {
  // DSL string repro cases from issue #871
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow()
  expect(() => fp.string("lcc_p-1mm").circuitJson()).toThrow()
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow()
  expect(() => fp.string("qfn16_p-0.5mm").circuitJson()).toThrow()
  expect(() => fp.string("qfn16_px0mm").circuitJson()).toThrow()
  expect(() => fp.string("qfn16_py0mm").circuitJson()).toThrow()

  // Direct schema validation rejection
  expect(() => base_quad_def.parse({ fn: "quad", p: 0 })).toThrow()
  expect(() => base_quad_def.parse({ fn: "quad", p: -0.5 })).toThrow()
  expect(() => base_quad_def.parse({ fn: "quad", px: 0 })).toThrow()
  expect(() => base_quad_def.parse({ fn: "quad", py: 0 })).toThrow()
  expect(() => base_quad_def.parse({ fn: "quad", p: Number.NaN })).toThrow()
  expect(() =>
    base_quad_def.parse({ fn: "quad", p: Number.POSITIVE_INFINITY }),
  ).toThrow()

  // quad_def validation rejection
  expect(() => quad_def.parse({ fn: "quad", p: 0 })).toThrow()
  expect(() => quad_def.parse({ fn: "quad", p: -1 })).toThrow()
  expect(() => quad_def.parse({ fn: "quad", px: 0 })).toThrow()
  expect(() => quad_def.parse({ fn: "quad", py: -0.5 })).toThrow()

  // Direct quad invocation rejection
  expect(() => quad({ fn: "quad", p: 0 } as any)).toThrow()
})

test("quad succeeds with valid positive pitch packages", () => {
  const lccSoup = fp.string("lcc_p0.5mm").circuitJson()
  const lccPad = lccSoup.find((e) => e.type === "pcb_smtpad") as any
  expect(lccPad).toBeDefined()
  expect(Number.isFinite(lccPad.x)).toBe(true)
  expect(Number.isFinite(lccPad.y)).toBe(true)

  const qfnSoup = fp.string("qfn16_p0.5mm").circuitJson()
  const qfnPad = qfnSoup.find((e) => e.type === "pcb_smtpad") as any
  expect(qfnPad).toBeDefined()
  expect(Number.isFinite(qfnPad.x)).toBe(true)
  expect(Number.isFinite(qfnPad.y)).toBe(true)
})
