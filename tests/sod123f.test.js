import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("sod123f", () => {
    const circuitJson = fp.string("sod123f").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123f");
});
