import { mm } from "@tscircuit/mm";
import type { AnyCircuitElement } from "circuit-json";

const clampRadius = (radius: number, width: number, height: number) =>
  Math.min(radius, width / 2, height / 2);

export const applyRounded = (
  elements: AnyCircuitElement[],
  rounded: number | string | undefined,
): AnyCircuitElement[] => {
  if (rounded === undefined) return elements;

  const radius = mm(rounded);
  if (!Number.isFinite(radius) || radius < 0) {
    throw new Error(
      `rounded radius must be a non-negative length, got "${rounded}"`,
    );
  }

  for (const element of elements) {
    if (
      element.type === "pcb_smtpad" &&
      (element.shape === "rect" || element.shape === "rotated_rect")
    ) {
      element.corner_radius = clampRadius(
        radius,
        element.width,
        element.height,
      );
    }

    if (
      element.type === "pcb_plated_hole" &&
      "rect_pad_width" in element &&
      "rect_pad_height" in element
    ) {
      element.rect_border_radius = clampRadius(
        radius,
        element.rect_pad_width,
        element.rect_pad_height,
      );
    }
  }

  return elements;
};
