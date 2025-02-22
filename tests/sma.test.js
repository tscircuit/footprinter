import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("sma", () => {
    const circuitJson = fp.string("sma").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sma");
});
