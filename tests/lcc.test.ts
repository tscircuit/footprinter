import { expect, test } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

test("lcc68", () => {
  const soup = fp.string("lcc68_w24.2_h24.2_p1.27mm").circuitJson();
  const svgContent = convertCircuitJsonToPcbSvg(soup);

  const pads = soup.filter((element) => element.type === "pcb_smtpad");
  expect(pads).toHaveLength(68);

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lcc68");
});
