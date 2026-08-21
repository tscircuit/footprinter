import { expect, test } from "bun:test";
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";

test("parity/lcc68_w25.5_h25.5_p1.27mm_pl1.7", async () => {
  const {
    avgRelDiff,
    courtyardDiffPercent,
    combinedFootprintElements,
    booleanDifferenceSvg,
  } = await compareFootprinterVsKicad(
    "lcc68_w25.5_h25.5_p1.27mm_pl1.7",
    "Package_LCC.pretty/PLCC-68_24.2x24.2mm_P1.27mm.circuit.json",
  );

  const svgContent = convertCircuitJsonToPcbSvg(combinedFootprintElements, {
    showCourtyards: true,
  });

  expect(avgRelDiff).toBeLessThan(0.05);
  expect(courtyardDiffPercent).toBeLessThan(10);

  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "lcc68_w25.5_h25.5_p1.27mm_pl1.7",
  );
  expect(booleanDifferenceSvg).toMatchSvgSnapshot(
    import.meta.path,
    "lcc68_w25.5_h25.5_p1.27mm_pl1.7_boolean_difference",
  );
});
