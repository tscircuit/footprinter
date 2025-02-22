import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";
test("stampreceiver", () => {
    const soup = fp
        .string("stampreceiver_left20_right20_bottom3_top2_w21mm_p2.54mm")
        .circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(soup);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "stampreceiver_left20_right20_bottom3_top2_w21mm_p2.54mm");
});
test("stampreceiver", () => {
    const soup = fp
        .string("stampreceiver_left20_right20_bottom3_top2_w21mm_p2.54mm_innerhole")
        .circuitJson();
    const svgContent = convertCircuitJsonToPcbSvg(soup);
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "stampreceiver_left20_right20_bottom3_top2_w21mm_p2.54mm_innerhole");
});
