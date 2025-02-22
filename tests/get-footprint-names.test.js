import { test, expect } from "bun:test";
import { getFootprintNames, getFootprintNamesByType } from "../src/footprinter";
test("getFootprintNames returns all footprint names", () => {
    const footprintNames = getFootprintNames();
    expect(footprintNames).toContain("res");
    expect(footprintNames).toContain("cap");
    expect(footprintNames).toContain("dip");
    expect(footprintNames).toContain("soic");
});
test("getFootprintNamesByType groups footprint names by component type", () => {
    const { passiveFootprintNames, normalFootprintNames } = getFootprintNamesByType();
    expect(passiveFootprintNames).toContain("res");
    expect(passiveFootprintNames).toContain("cap");
    expect(passiveFootprintNames).toContain("diode");
    expect(passiveFootprintNames).toContain("led");
    expect(normalFootprintNames).toContain("dip");
    expect(normalFootprintNames).toContain("soic");
    expect(normalFootprintNames).toContain("qfp");
    expect(normalFootprintNames).not.toContain("res");
    expect(normalFootprintNames).not.toContain("cap");
    expect(normalFootprintNames).not.toContain("diode");
    expect(normalFootprintNames).not.toContain("led");
});
