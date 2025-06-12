import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

const expectPad = (
  soup: any[],
  shape: string,
  size: number | { width: number; height: number },
) => {
  const pad = soup[0]
  expect(pad.type).toBe("pcb_smtpad")
  expect(pad.layer).toBe("top")
  expect(pad.shape).toBe(shape)
  if (shape === "circle") {
    expect(pad.radius).toBeCloseTo(typeof size === "number" ? size : 0)
  } else {
    const { width, height } = size as { width: number; height: number }
    expect(pad.width).toBeCloseTo(width)
    expect(pad.height).toBeCloseTo(height)
  }
}

test("smtpad circle diameter", async () => {
  const { snapshotSoup } = await getTestFixture("smtpad_circle_d1.2")
  const soup = fp().smtpad().circle().d("1.2mm").circuitJson()
  expectPad(soup, "circle", 0.6)
  snapshotSoup(soup)
})

test("smtpad circle radius alias", () => {
  const soup = fp().smtpad().circle().radius("0.6mm").circuitJson()
  expectPad(soup, "circle", 0.6)
})

test("smtpad circle default size", () => {
  const soup = fp().smtpad().circle().circuitJson()
  expectPad(soup, "circle", 0.5)
})

test("smtpad rect w/h", async () => {
  const { snapshotSoup } = await getTestFixture("smtpad_rect_w2_h1")
  const soup = fp().smtpad().rect().w("2mm").h("1mm").circuitJson()
  expectPad(soup, "rect", { width: 2, height: 1 })
  snapshotSoup(soup)
})

test("smtpad rect w only defaults square", () => {
  const soup = fp().smtpad().rect().w("2mm").circuitJson()
  expectPad(soup, "rect", { width: 2, height: 2 })
})

test("smtpad square width", () => {
  const soup = fp().smtpad().square().w("1.5mm").circuitJson()
  expectPad(soup, "rect", { width: 1.5, height: 1.5 })
})

test("smtpad square size alias", () => {
  const soup = fp().smtpad().square().size("1.5mm").circuitJson()
  expectPad(soup, "rect", { width: 1.5, height: 1.5 })
})

test("smtpad from string", () => {
  const soup = fp.string("smtpad_circle_d1.2").circuitJson()
  expectPad(soup, "circle", 0.6)
})
