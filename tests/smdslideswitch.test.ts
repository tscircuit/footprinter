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

test("smdslideswitch7 represents MINI MSK12CO2", () => {
  const footprint =
    "smdslideswitch7_p1mm_pw0.7mm_pl1.5mm_mounty-1.800098mm_mpx5.500116mm_mpy2.200148mm_mpw1mm_mpl0.8mm_holex1.499997mm_holed0.900024mm";
  const circuitJson = fp.string(footprint).circuitJson();

  expect(getPadGeometry(footprint)).toEqual([
    { x: -1, y: 0, width: 0.7, height: 1.5, port_hints: ["1"] },
    { x: 0, y: 0, width: 0.7, height: 1.5, port_hints: ["2"] },
    { x: 1, y: 0, width: 0.7, height: 1.5, port_hints: ["3"] },
    {
      x: -2.750058,
      y: -0.700024,
      width: 1,
      height: 0.8,
      port_hints: ["4"],
    },
    {
      x: 2.750058,
      y: -0.700024,
      width: 1,
      height: 0.8,
      port_hints: ["5"],
    },
    {
      x: -2.750058,
      y: -2.900172,
      width: 1,
      height: 0.8,
      port_hints: ["6"],
    },
    {
      x: 2.750058,
      y: -2.900172,
      width: 1,
      height: 0.8,
      port_hints: ["7"],
    },
  ]);
  expect(
    circuitJson
      .filter((element) => element.type === "pcb_hole")
      .map(({ x, y, hole_diameter }) => ({ x, y, hole_diameter })),
  ).toEqual([
    { x: -1.499997, y: -1.800098, hole_diameter: 0.900024 },
    { x: 1.499997, y: -1.800098, hole_diameter: 0.900024 },
  ]);
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "mini_msk12co2",
  );
});

test("smdslideswitch7 supports a missing signal position", () => {
  const footprint =
    "smdslideswitch7_signalcols4_missing(2)_p1.5mm_pw0.6mm_pl1.524mm_mounty-2.250059mm_mpx7.199884mm_mpy2.29997mm_mpw1.2mm_mpl0.7mm_holex1.499997mm_holey-2.250186mm_holed0.900024mm";
  const circuitJson = fp.string(footprint).circuitJson();

  expect(getPadGeometry(footprint)).toEqual([
    { x: -2.25, y: 0, width: 0.6, height: 1.524, port_hints: ["1"] },
    { x: 0.75, y: 0, width: 0.6, height: 1.524, port_hints: ["2"] },
    { x: 2.25, y: 0, width: 0.6, height: 1.524, port_hints: ["3"] },
    {
      x: -3.599942,
      y: -1.100074,
      width: 1.2,
      height: 0.7,
      port_hints: ["4"],
    },
    {
      x: 3.599942,
      y: -1.100074,
      width: 1.2,
      height: 0.7,
      port_hints: ["5"],
    },
    {
      x: -3.599942,
      y: -3.400044,
      width: 1.2,
      height: 0.7,
      port_hints: ["6"],
    },
    {
      x: 3.599942,
      y: -3.400044,
      width: 1.2,
      height: 0.7,
      port_hints: ["7"],
    },
  ]);
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "msk12c02",
  );
});

test("smdslideswitch7 rejects the wrong signal-pad count", () => {
  expect(() => fp.string("smdslideswitch7_signalcols4").circuitJson()).toThrow(
    "needs 3 signal pads",
  );
});
