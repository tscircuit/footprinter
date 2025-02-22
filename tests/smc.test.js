import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("smc", () => {
    const circuitJson = fp.string("smc").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "smc");
});
