import type { z } from "zod";
import { pinrow, pinrow_def } from "./pinrow";

/**
 * A pluggable board module made from a female pin header.
 *
 * Header modules use the same geometry and options as `pinrow`, but have a
 * distinct footprint name so consumers can tell a module interface from an
 * ordinary pin header.
 */
export const headermodule_def = pinrow_def;

export const headermodule = (
  raw_params: z.input<typeof headermodule_def>,
): ReturnType<typeof pinrow> => pinrow({ ...raw_params, fn: "headermodule" });
