import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("sot363", () => {
    const soup = fp.string("sot363").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(soup);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot363");
});
