import {
  type AnyCircuitElement,
  type PcbSmtPad,
  type PcbVia,
  length,
} from "circuit-json";
import { z } from "zod";
import { dim2d } from "./zod/dim-2d";

const thermalViaGrid = dim2d.refine(
  ({ x, y }) => Number.isInteger(x) && Number.isInteger(y) && x > 0 && y > 0,
  "thermal via grid dimensions must be positive integers",
);

const positiveLength = length.refine((value) => value > 0, {
  message: "thermal via dimensions must be positive",
});

export const thermalViaDef = z.object({
  thermalvias: z.union([z.literal(true), thermalViaGrid]).optional(),
  thermalviapitch: positiveLength.optional(),
  thermalviaid: positiveLength
    .optional()
    .describe("thermal via inner (hole) diameter"),
  thermalviaod: positiveLength
    .optional()
    .describe("thermal via outer diameter"),
});

type ThermalViaParameters = z.infer<typeof thermalViaDef>;

const defaults = {
  grid: { x: 4, y: 4 },
  pitch: length.parse("1mm"),
  holeDiameter: length.parse("0.3048mm"),
  outerDiameter: length.parse("0.6096mm"),
};

const createThermalVias = (
  parameters: ThermalViaParameters,
  thermalPad: PcbSmtPad,
): PcbVia[] => {
  if (!parameters.thermalvias) return [];

  const grid =
    parameters.thermalvias === true ? defaults.grid : parameters.thermalvias;
  const pitch = parameters.thermalviapitch ?? defaults.pitch;
  const holeDiameter = parameters.thermalviaid ?? defaults.holeDiameter;
  const outerDiameter = parameters.thermalviaod ?? defaults.outerDiameter;

  if (outerDiameter < holeDiameter) {
    throw new Error(
      "thermalviaod must be greater than or equal to thermalviaid",
    );
  }

  const viaArrayWidth = (grid.x - 1) * pitch + outerDiameter;
  const viaArrayHeight = (grid.y - 1) * pitch + outerDiameter;
  if (viaArrayWidth > thermalPad.width || viaArrayHeight > thermalPad.height) {
    throw new Error("thermal via grid must fit inside thermalpad");
  }

  return Array.from({ length: grid.x * grid.y }, (_, index) => {
    const column = index % grid.x;
    const row = Math.floor(index / grid.x);
    return {
      pcb_via_id: "",
      type: "pcb_via",
      x: thermalPad.x + (column - (grid.x - 1) / 2) * pitch,
      y: thermalPad.y + (row - (grid.y - 1) / 2) * pitch,
      hole_diameter: holeDiameter,
      outer_diameter: outerDiameter,
      layers: ["top", "bottom"],
    };
  });
};

export const addThermalVias = (
  circuitJson: AnyCircuitElement[],
  parameters: ThermalViaParameters,
): AnyCircuitElement[] => {
  if (!parameters.thermalvias) return circuitJson;

  const thermalPad = circuitJson.find(
    (element): element is PcbSmtPad =>
      element.type === "pcb_smtpad" &&
      element.port_hints.includes("thermalpad"),
  );
  if (!thermalPad) throw new Error("thermalvias requires a thermalpad");

  return [...circuitJson, ...createThermalVias(parameters, thermalPad)];
};
