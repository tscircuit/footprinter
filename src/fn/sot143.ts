import type { AnyCircuitElement, PcbCourtyardRect } from "circuit-json";
import { length } from "circuit-json";
import { z } from "zod";
import { rectpad } from "../helpers/rectpad";
import { silkscreenRef } from "../helpers/silkscreenRef";
import { silkscreenpath } from "../helpers/silkscreenpath";
import { base_def } from "../helpers/zod/base_def";

export const sot143_def = base_def.extend({
  fn: z.literal("sot143"),
  num_pins: z.literal(4).default(4),
  p: length.default("2.382774mm"),
  px: length.default("1.89992mm"),
  pw: length.default("0.8382mm"),
  ph: length.default("0.8382mm"),
  pin1padwidth: length.default("1.1938mm"),
  pin1centeroffsetx: length.default("0.199898mm"),
  w: length.default("3mm"),
  h: length.default("2.9mm"),
});

export const sot143 = (
  rawParams: z.input<typeof sot143_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot143_def.parse(rawParams);
  const { p, px, pw, ph, pin1padwidth, pin1centeroffsetx, w, h } = parameters;
  const halfX = px / 2;
  const halfY = p / 2;
  const pads = [
    rectpad(1, -halfX + pin1centeroffsetx, -halfY, pin1padwidth, ph),
    rectpad(2, halfX, -halfY, pw, ph),
    rectpad(3, halfX, halfY, pw, ph),
    rectpad(4, -halfX, halfY, pw, ph),
  ];
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  const silkscreen = [
    silkscreenpath([
      { x: -halfWidth, y: -halfHeight / 2 },
      { x: -halfWidth, y: halfHeight / 2 },
    ]),
    silkscreenpath([
      { x: halfWidth, y: halfHeight / 2 },
      { x: halfWidth, y: -halfHeight / 2 },
    ]),
  ];
  const copperWidth = px + Math.max(pin1padwidth, pw);
  const copperHeight = p + ph;
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: Math.max(w, copperWidth) + 0.5,
    height: Math.max(h, copperHeight) + 0.5,
    layer: "top",
  };

  return {
    circuitJson: [
      ...pads,
      ...silkscreen,
      silkscreenRef(0, Math.max(halfHeight, copperHeight / 2) + 0.8, 0.4),
      courtyard,
    ],
    parameters,
  };
};
