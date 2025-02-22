import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("qfn16_w4_h4_p0.65mm", () => {
    const soup = fp.string("qfn16_w4_h4_p0.65mm").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(soup);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfn16_w4_h4_p0.65mm");
});
