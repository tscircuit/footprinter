import { expect, test } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

test("rounded radius applies globally through the string and builder APIs", () => {
  const fromString = fp.string("soic8_rounded0.2mm").circuitJson();
  const fromBuilder = fp().soic(8).rounded("0.2mm").circuitJson();
  const pads = fromString.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  );

  expect(fromBuilder).toEqual(fromString);
  expect(pads).toHaveLength(8);
  expect(pads.every((pad) => pad.corner_radius === 0.2)).toBe(true);

  const svgContent = convertCircuitJsonToPcbSvg(fromString);
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8_rounded0.2mm");
});

test("rounded radius applies to rectangular plated-hole pads", () => {
  const circuitJson = fp.string("dip8_rounded0.3mm").circuitJson();
  const pin1 = circuitJson.find(
    (element) =>
      element.type === "pcb_plated_hole" && element.port_hints?.includes("1"),
  );

  expect(pin1?.shape).toBe("circular_hole_with_rect_pad");
  if (pin1?.shape !== "circular_hole_with_rect_pad") return;
  expect(pin1.rect_border_radius).toBe(0.3);
});

test("rounded radius is clamped to the pad dimensions", () => {
  const [pad] = fp.string("smtpad_rect_w2mm_h1mm_rounded2mm").circuitJson();

  expect(pad?.type).toBe("pcb_smtpad");
  if (pad?.type !== "pcb_smtpad" || pad.shape !== "rect") return;
  expect(pad.corner_radius).toBe(0.5);
});

test("rounded zero overrides generator defaults", () => {
  const pads = fp
    .string("soic8_rounded0")
    .circuitJson()
    .filter(
      (element) => element.type === "pcb_smtpad" && element.shape === "rect",
    );

  expect(pads.every((pad) => pad.corner_radius === 0)).toBe(true);
});

test("rounded rejects negative radii", () => {
  expect(() => fp().soic(8).rounded(-0.1).circuitJson()).toThrow(
    "rounded radius must be non-negative",
  );
});
