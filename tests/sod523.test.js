import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("sod523", () => {
    const soup = fp.string("sod523").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(soup);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod523");
});
