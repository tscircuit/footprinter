import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json";
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef";
import { z } from "zod";
import { rectpad } from "../helpers/rectpad";

export const sot223_def = z.object({
  fn: z.string(),
  w: z.string().default("3.5mm"),  // Width of package
  h: z.string().default("6.5mm"),  // Height of package
  pl: z.string().default("1.5mm"), // Pad length
  pw: z.string().default("0.8mm"), // Pad width
  p: z.string().default("2.3mm"),  // Pin pitch
});

export const sot223 = (
  raw_params: z.input<typeof sot223_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot223_def.parse(raw_params);
  return {
    circuitJson: sot223_pads(parameters),
    parameters: parameters,
  };
};

export const getSot223Coords = (parameters: {
  pn: number;
  w: number;
  h: number;
  p: number;
}) => {
  const { pn, w, h, p } = parameters;

  switch (pn) {
    case 1:
      return { x: -p, y: -h / 2 + 1 };
    case 2:
      return { x: 0, y: -h / 2 + 1 };
    case 3:
      return { x: p, y: -h / 2 + 1 };
    case 4:
      return { x: 0, y: h / 2 - 1 }; // Large tab
    default:
      throw new Error("Invalid pin number for SOT-223");
  }
};

export const sot223_pads = (parameters: z.infer<typeof sot223_def>) => {
  const pads: AnyCircuitElement[] = [];

  for (let i = 1; i <= 4; i++) {
    const { x, y } = getSot223Coords({
      pn: i,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      p: Number.parseFloat(parameters.p),
    });

    pads.push(
      rectpad(
        i,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw)
      )
    );
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, Number.parseFloat(parameters.h) + 0.3, 0.3);
  return [...pads, silkscreenRefText as AnyCircuitElement];
};
