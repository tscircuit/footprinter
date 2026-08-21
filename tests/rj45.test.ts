import { expect, test } from "bun:test";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import { fp } from "../src/footprinter";

const variants = [
  {
    name: "R-RJ45R08P-B000",
    footprint:
      "rj45_p1.02mm_py1.780032mm_shieldx8.130032mm_shieldy0.130048mm_shieldid1.7999964mm_shieldod2.499995mm_holex6.35mm_holey-3.430016mm_holed3.2499808mm",
    platedHoleCount: 10,
    locatorX: 6.35,
    locatorY: -3.430016,
    pin1: { x: 3.57, y: -0.890016 },
    shieldPins: [["9"], ["10"]],
  },
  {
    name: "R-RJ45R08P-C000",
    footprint:
      "rj45_ledpins_p1.02mm_py1.780032mm_shieldx8.130032mm_shieldy0.130048mm_shieldid1.9000216mm_shieldod2.499995mm_holex6.35mm_holey-3.430016mm_holed3.3000188mm_ledx4.569968mm_ledp2.290064mm_ledy5.700014mm",
    platedHoleCount: 14,
    locatorX: 6.35,
    locatorY: -3.430016,
    pin1: { x: 3.57, y: -0.890016 },
    shieldPins: [["14"], ["13"]],
  },
  {
    name: "R-RJ45R10P-B000",
    footprint:
      "rj45_firstpintop_p1.27mm_py2.54mm_shieldx7.750048mm_shieldy10.670032mm_shieldid1.5999968mm_shieldod2.499995mm_holex5.715mm_holey7.62mm_holed3.1999936mm_bodyy6.32mm_h18.4mm_w15.8mm",
    platedHoleCount: 10,
    locatorX: 5.715,
    locatorY: 7.62,
    pin1: { x: 4.445, y: 1.27 },
    shieldPins: [["10"], ["9"]],
  },
  {
    name: "R-RJ45S08P-C000",
    footprint:
      "rj45_ledpins_firstpinleft_p1.27mm_py2.54mm_shieldx7.914894mm_shieldy-3.770122mm_shieldid1.700022mm_shieldod2.499995mm_holex5.715mm_holey-7.62mm_holed3.3000188mm_ledx3.869944mm_ledp2.54mm_ledy-11.729974mm_bodyy-5.865mm_h16.764mm_w16.256mm",
    platedHoleCount: 14,
    locatorX: 5.715,
    locatorY: -7.62,
    pin1: { x: -4.445, y: -1.27 },
    shieldPins: [["13"], ["14"]],
  },
] as const;

for (const variant of variants) {
  test(`rj45 represents ${variant.name}`, () => {
    const circuitJson = fp.string(variant.footprint).circuitJson();
    const platedHoles = circuitJson.filter(
      (element) => element.type === "pcb_plated_hole",
    );
    const locatorHoles = circuitJson.filter(
      (element) => element.type === "pcb_hole",
    );

    expect(platedHoles).toHaveLength(variant.platedHoleCount);
    expect({
      x: platedHoles[0]!.x,
      y: platedHoles[0]!.y,
    }).toEqual(variant.pin1);
    expect(platedHoles.slice(-2).map(({ port_hints }) => port_hints)).toEqual(
      variant.shieldPins,
    );
    expect(locatorHoles).toHaveLength(2);
    expect(locatorHoles.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: -variant.locatorX, y: variant.locatorY },
      { x: variant.locatorX, y: variant.locatorY },
    ]);

    expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
      import.meta.path,
      variant.name,
    );
  });
}

test("rj45 uses the expected staggered signal and optional LED geometry", () => {
  const circuitJson = fp.string("rj45_ledpins").circuitJson();
  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  );

  expect(
    platedHoles.slice(0, 8).map(({ x, y, port_hints }) => ({
      x,
      y,
      port_hints,
    })),
  ).toEqual([
    { x: 3.57, y: -0.89, port_hints: ["1"] },
    { x: 2.55, y: 0.89, port_hints: ["2"] },
    { x: 1.53, y: -0.89, port_hints: ["3"] },
    { x: 0.51, y: 0.89, port_hints: ["4"] },
    { x: -0.51, y: -0.89, port_hints: ["5"] },
    { x: -1.53, y: 0.89, port_hints: ["6"] },
    { x: -2.55, y: -0.89, port_hints: ["7"] },
    { x: -3.57, y: 0.89, port_hints: ["8"] },
  ]);
  expect(platedHoles.slice(8, 12).map(({ x, y }) => ({ x, y }))).toEqual([
    { x: -6.86, y: 5.7 },
    { x: -4.57, y: 5.7 },
    { x: 4.57, y: 5.7 },
    { x: 6.86, y: 5.7 },
  ]);
  expect(
    fp()
      .rj45(14)
      .circuitJson()
      .filter((element) => element.type === "pcb_plated_hole"),
  ).toHaveLength(14);
});
