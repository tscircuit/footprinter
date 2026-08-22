import { test, expect } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

test("tssop", () => {
  const soup = fp.string("tssop8_w5.3mm_p1.27mm").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(soup);
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop8_w5.3mm_p1.27mm",
  );
});

test("tssop20_w6.5mm_p0.65mm", () => {
  const soup = fp.string("tssop20_w6.5mm_p0.65mm").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(soup);
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop20_w6.5mm_p0.65mm",
  );
});

test("tssop8", () => {
  const soup = fp.string("tssop8").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(soup);
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tssop8");
});

test("C78589 SOP-6 uses square pads when rounded is zero", () => {
  const soup = fp
    .string(
      "tssop6_w6.1599572mm_p2.54mm_pw1.4224mm_pl2.5999948mm_rounded0_pin1location(rightside,top)",
    )
    .circuitJson();
  const pads = soup.filter(
    (element) =>
      element.type === "pcb_smtpad" && element.shape === "rotated_rect",
  );

  expect(pads).toHaveLength(6);
  expect(pads.every((pad) => pad.corner_radius === 0)).toBe(true);

  const svgContent = convertCircuitJsonToPcbSvg(soup);
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "C78589_sop6");
});
