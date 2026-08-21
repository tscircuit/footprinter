import type { AnySoupElement } from "circuit-json";
import { type PassiveDef, passive } from "src/helpers/passive-fn";
import { createFabricationNoteDiodeFromCircuitJson } from "../helpers/create-fabrication-note-diode";

export const diode = (
  parameters: PassiveDef,
): { circuitJson: AnySoupElement[]; parameters: PassiveDef } => {
  const circuitJson = passive({ ...parameters, roundedPads: true });

  return {
    circuitJson: circuitJson.concat(
      createFabricationNoteDiodeFromCircuitJson(circuitJson, {
        anodePin: parameters.anodepin,
        cathodePin: parameters.cathodepin,
      }),
    ),
    parameters,
  };
};
