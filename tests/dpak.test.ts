import { expect, test } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

const getPadGeometry = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
    .map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    }));

test("dpak3 creates two leads and a pin 2 tab", () => {
  const footprint =
    "dpak3_p2.29mm_pw1.6mm_pl3mm_tabw6.2mm_tabh5.8mm_span6.85mm";
  const circuitJson = fp.string(footprint).circuitJson();

  expect(getPadGeometry(footprint)).toEqual([
    {
      x: -3.425,
      y: 2.29,
      width: 3,
      height: 1.6,
      port_hints: ["1"],
    },
    {
      x: -3.425,
      y: -2.29,
      width: 3,
      height: 1.6,
      port_hints: ["3"],
    },
    {
      x: 3.425,
      y: 0,
      width: 6.2,
      height: 5.8,
      port_hints: ["2"],
    },
  ]);

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "dpak3",
  );
});

test("dpak6 creates five leads and a pin 6 tab", () => {
  const footprint =
    "dpak6_p1.27mm_pw0.8255mm_pl2.2mm_tabw6.2103mm_tabh6.2103mm_span7.0866mm";
  const circuitJson = fp.string(footprint).circuitJson();

  expect(getPadGeometry(footprint)).toHaveLength(6);
  expect(getPadGeometry(footprint).at(0)).toEqual({
    x: -3.5433,
    y: 2.54,
    width: 2.2,
    height: 0.8255,
    port_hints: ["1"],
  });
  expect(getPadGeometry(footprint).at(-1)).toEqual({
    x: 3.5433,
    y: 0,
    width: 6.2103,
    height: 6.2103,
    port_hints: ["6"],
  });

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "dpak6",
  );
});

test("d2pak and TO package aliases select the expected defaults", () => {
  expect(getPadGeometry("d2pak3")).toEqual(getPadGeometry("TO-263-3"));
  expect(getPadGeometry("dpak3")).toEqual(getPadGeometry("TO-252-3"));
  expect(getPadGeometry("TO-263-5")).toHaveLength(6);
  expect(getPadGeometry("TO-252-5")).toHaveLength(6);
});
