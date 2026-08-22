import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

test("to92s", () => {
  const circuitJson = fp.string("to92s").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  });
  expect(svgContent).toMatchSvgSnapshot(import.meta.path);

  const courtyard = circuitJson.find(
    (element) => element.type === "pcb_courtyard_rect",
  );
  expect(courtyard).toMatchObject({
    center: { x: 0, y: 1.3 },
    width: 4.7,
    height: 3.1,
  });
});

test("to92s_2", () => {
  const circuitJson = fp.string("to92s_2").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92s_2");
});

test("to92s_3", () => {
  const circuitJson = fp.string("to92s_3").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  });
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92s_3");
});
// invalid test
test("to92s_4", () => {
  try {
    const circuitJson = fp.string("to92s_4").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
      showCourtyards: true,
    });
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92s_4");
  } catch (error) {
    const e = error as Error;
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toContain("Invalid literal value, expected 3");
    expect(e.message).toContain("Invalid literal value, expected 2");
  }
});
