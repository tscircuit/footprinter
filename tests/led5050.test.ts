import { expect, test } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

test("led5050 creates 6 pads matching the KiCad LED_RGB_5050-6 land pattern", () => {
  const circuitJson = fp.string("led5050").circuitJson();
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad");

  expect(pads).toHaveLength(6);
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -2.4, y: 1.7, width: 2, height: 1.1, port_hints: ["1"] },
    { x: 2.4, y: 1.7, width: 2, height: 1.1, port_hints: ["6"] },
    { x: -2.4, y: 0, width: 2, height: 1.1, port_hints: ["2"] },
    { x: 2.4, y: 0, width: 2, height: 1.1, port_hints: ["5"] },
    { x: -2.4, y: -1.7, width: 2, height: 1.1, port_hints: ["3"] },
    { x: 2.4, y: -1.7, width: 2, height: 1.1, port_hints: ["4"] },
  ]);

  const fabricationNotePaths = circuitJson.filter(
    (element) => element.type === "pcb_fabrication_note_path",
  );
  expect(
    fabricationNotePaths.flatMap((element) =>
      element.pcb_fabrication_note_path_id.includes("_triangle_")
        ? [element.pcb_fabrication_note_path_id]
        : [],
    ),
  ).toEqual([
    "diode_fabrication_note_triangle_green",
    "diode_fabrication_note_triangle_red",
    "diode_fabrication_note_triangle_blue",
  ]);

  const polarityLabels = circuitJson.flatMap((element) =>
    element.type === "pcb_fabrication_note_text"
      ? [
          {
            id: element.pcb_fabrication_note_text_id,
            text: element.text,
            x: element.anchor_position.x,
            y: element.anchor_position.y,
          },
        ]
      : [],
  );
  expect(polarityLabels).toEqual([
    {
      id: "diode_fabrication_note_positive_green",
      text: "+",
      x: -2.55,
      y: 1.7,
    },
    { id: "diode_fabrication_note_negative_green", text: "-", x: 2.55, y: 1.7 },
    { id: "diode_fabrication_note_positive_red", text: "+", x: -2.55, y: 0 },
    { id: "diode_fabrication_note_negative_red", text: "-", x: 2.55, y: 0 },
    {
      id: "diode_fabrication_note_positive_blue",
      text: "+",
      x: -2.55,
      y: -1.7,
    },
    { id: "diode_fabrication_note_negative_blue", text: "-", x: 2.55, y: -1.7 },
  ]);

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led5050");
});

test("led5050 supports parameter overrides", () => {
  const circuitJson = fp.string("led5050_rowspan5mm_p1.6mm").circuitJson();
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad");

  expect(pads).toHaveLength(6);
  const pad1 = pads.find((p) => p.port_hints?.includes("1"));
  expect(pad1?.x).toBe(-2.5);
  expect(pad1?.y).toBe(1.6);
});
