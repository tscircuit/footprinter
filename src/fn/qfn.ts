import type { AnySoupElement } from "circuit-json";
import { addThermalVias, thermalViaDef } from "src/helpers/create-thermal-vias";
import type { z } from "zod";
import { base_quad_def, quad, quadTransform } from "./quad";

export const qfn_def = base_quad_def
  .extend(thermalViaDef.shape)
  .transform(quadTransform);

export const qfn = (
  rawParameters: z.input<typeof qfn_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const qfnParameters = {
    ...rawParameters,
    legsoutside: false,
    pl: rawParameters.pl ?? 0.875,
    pw: rawParameters.pw ?? 0.25,
  };
  const quadResult = quad(qfnParameters);
  const thermalViaParameters = thermalViaDef.parse(rawParameters);

  return {
    circuitJson: addThermalVias(quadResult.circuitJson, thermalViaParameters),
    parameters: { ...quadResult.parameters, ...thermalViaParameters },
  };
};
