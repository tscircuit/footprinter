import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("pad footprint", async () => {
  const { snapshotSoup } = await getTestFixture("pad")
  const soup = fp().pad().w(2).h(1).circuitJson()
  expect(soup).toMatchInlineSnapshot(`
[
  {
    "height": 1,
    "layer": "top",
    "pcb_smtpad_id": "",
    "port_hints": [
      "1",
    ],
    "shape": "rect",
    "type": "pcb_smtpad",
    "width": 2,
    "x": 0,
    "y": 0,
  },
  {
    "anchor_alignment": "center",
    "anchor_position": {
      "x": 0,
      "y": 1,
    },
    "font": "tscircuit2024",
    "font_size": 0.2,
    "layer": "top",
    "pcb_component_id": "pcb_component_1",
    "pcb_silkscreen_text_id": "silkscreen_text_1",
    "text": "{REF}",
    "type": "pcb_silkscreen_text",
  },
]
`)
  snapshotSoup(soup)
})

test("pad footprint with different dimensions", async () => {
  const { snapshotSoup } = await getTestFixture("pad_3x2")
  const soup = fp().pad().w(3).h(2).circuitJson()
  expect(soup).toMatchInlineSnapshot(`
[
  {
    "height": 2,
    "layer": "top",
    "pcb_smtpad_id": "",
    "port_hints": [
      "1",
    ],
    "shape": "rect",
    "type": "pcb_smtpad",
    "width": 3,
    "x": 0,
    "y": 0,
  },
  {
    "anchor_alignment": "center",
    "anchor_position": {
      "x": 0,
      "y": 1.5,
    },
    "font": "tscircuit2024",
    "font_size": 0.2,
    "layer": "top",
    "pcb_component_id": "pcb_component_1",
    "pcb_silkscreen_text_id": "silkscreen_text_1",
    "text": "{REF}",
    "type": "pcb_silkscreen_text",
  },
]
`)
  snapshotSoup(soup)
})
