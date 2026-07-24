import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const def =
  "pinrow2_id1.016_od1.88_nosquareplating_pinlabeltextalignright_pinlabelorthogonal_doublesidedpinlabel_pinlabelverticallyinverted"

test(def, () => {
  const circuitJson = fp.string(def).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pinrowJson = fp.string(def).json() as any

  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 2,
    rows: 1,
    id: 1.016,
    od: 1.88,
    male: true,
    female: false,
    nosquareplating: true,
    pinlabeltextalignright: true,
    pinlabelorthogonal: true,
    pinlabelverticallyinverted: true,
    doublesidedpinlabel: true,
  })

  const platedHoles = circuitJson.filter((el) => el.type === "pcb_plated_hole")
  expect(
    platedHoles.map((el) => ({
      pn: el.port_hints?.[0],
      shape: el.shape,
    })),
  ).toEqual([
    { pn: "1", shape: "circle" },
    { pn: "2", shape: "circle" },
  ])

  const pinLabels = circuitJson
    .filter(
      (el) =>
        el.type === "pcb_silkscreen_text" && el.text?.match(/^\{PIN\d+\}$/),
    )
    .map((el) => ({
      text: el.text,
      layer: el.layer,
      anchor_position: el.anchor_position,
      anchor_alignment: el.anchor_alignment,
      ccw_rotation: el.ccw_rotation,
    }))

  expect(pinLabels).toEqual([
    {
      text: "{PIN1}",
      layer: "top",
      anchor_position: { x: -1.27, y: 1.54 },
      anchor_alignment: "center_right",
      ccw_rotation: 270,
    },
    {
      text: "{PIN1}",
      layer: "bottom",
      anchor_position: { x: -1.27, y: 1.54 },
      anchor_alignment: "center_left",
      ccw_rotation: 270,
    },
    {
      text: "{PIN2}",
      layer: "top",
      anchor_position: { x: 1.27, y: 1.54 },
      anchor_alignment: "center_right",
      ccw_rotation: 270,
    },
    {
      text: "{PIN2}",
      layer: "bottom",
      anchor_position: { x: 1.27, y: 1.54 },
      anchor_alignment: "center_left",
      ccw_rotation: 270,
    },
  ])

  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
