import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("sod882", () => {
    const circuitJson = fp.string("sod882").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod882");
});
