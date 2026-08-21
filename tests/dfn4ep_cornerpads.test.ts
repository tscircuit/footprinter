import { expect, test } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

test("dfn4_cornerpads", () => {
  const circuitJson = fp
    .string(
      "dfn4_w0.85mm_p0.9mm_pl0.2mm_pw0.4mm_cornerpads_cornerpadcutlength0.15mm_thermalpad0.48mmx0.48mm_pin1location(leftside,bottom)_rounded0",
    )
    .circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn4_cornerpads");
});

test("dfn4 corner pads derive their geometry from DFN parameters", () => {
  const pads = fp
    .string(
      "dfn4_w1.2mm_p0.8mm_pl0.3mm_pw0.5mm_cornerpads_cornerpadcutlength0.1mm_thermalpad0.6mmx0.7mm",
    )
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad");

  expect(pads[0]?.shape).toBe("polygon");
  if (pads[0]?.shape !== "polygon") return;
  const expectedPoints = [
    { x: -0.3, y: 0.25 },
    { x: -0.3, y: 0.65 },
    { x: -0.6, y: 0.65 },
    { x: -0.6, y: 0.15 },
    { x: -0.4, y: 0.15 },
  ];
  for (const [index, expectedPoint] of expectedPoints.entries()) {
    expect(pads[0].points[index]?.x).toBeCloseTo(expectedPoint.x);
    expect(pads[0].points[index]?.y).toBeCloseTo(expectedPoint.y);
  }
  expect(pads[4]).toMatchObject({
    shape: "rect",
    width: 0.6,
    height: 0.7,
  });
});
