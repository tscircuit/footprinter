import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("dfn8_w5.3mm_p1.27mm", () => {
    const soup = fp.string("dfn8_w5.3mm_p1.27mm").circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(soup);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn8_w5.3mm_p1.27mm");
});
