import { mm } from "@tscircuit/mm";
import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  length,
  rotation,
} from "circuit-json";
import { determinePinlabelAnchorSide } from "src/helpers/determine-pin-label-anchor-side";
import { silkscreenPin } from "src/helpers/silkscreenPin";
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef";
import { z } from "zod";
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad";
import { platedhole } from "../helpers/platedhole";
import { rectpad } from "../helpers/rectpad";
import { silkscreenpath } from "../helpers/silkscreenpath";
import { base_def } from "../helpers/zod/base_def";
import { function_call } from "../helpers/zod/function-call";

export const pinrow_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().optional().default(6),
    rows: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .default(1)
      .describe("number of rows"),
    cols: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .describe("number of nominal columns in a sparse grid"),
    p: length.default("0.1in").describe("pitch"),
    py: length.optional().describe("vertical row pitch"),
    id: length.default("1.0mm").describe("inner diameter"),
    od: length.default("1.5mm").describe("outer diameter"),
    missing: function_call
      .default([])
      .describe("row-major nominal grid positions to omit"),
    male: z.boolean().optional().describe("for male pin headers"),
    female: z.boolean().optional().describe("for female pin headers"),
    smd: z.boolean().optional().describe("surface mount device"),
    surfacemount: z
      .boolean()
      .optional()
      .describe("surface mount device (verbose)"),
    rightangle: z.boolean().optional().describe("right angle"),
    pw: length.optional().default("1.0mm").describe("pad width for SMD"),
    pl: length.optional().default("2.0mm").describe("pad length for SMD"),
    pinlabeltextalignleft: z.boolean().optional().default(false),
    pinlabeltextaligncenter: z.boolean().optional().default(false),
    pinlabeltextalignright: z.boolean().optional().default(false),
    pinlabelverticallyinverted: z.boolean().optional().default(false),
    pinlabelorthogonal: z.boolean().optional().default(false),
    nosquareplating: z
      .boolean()
      .optional()
      .default(false)
      .describe("do not use rectangular pad for pin 1"),
    nopinlabels: z
      .boolean()
      .optional()
      .default(false)
      .describe("omit silkscreen pin labels"),
    doublesidedpinlabel: z
      .boolean()
      .optional()
      .default(false)
      .describe("add silkscreen pins in top and bottom layers"),
    bottomsidepinlabel: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "place the silkscreen reference text on the bottom layer instead of top",
      ),
    silkscreenborder: z
      .boolean()
      .optional()
      .default(false)
      .describe("add a rectangular silkscreen border around the pin row"),
    silkscreenlabel: z
      .string()
      .transform((value) =>
        value.startsWith("(") && value.endsWith(")")
          ? value.slice(1, -1)
          : value,
      )
      .optional()
      .describe(
        "replace the reference designator with a custom silkscreen label",
      ),
  })
  .transform((data) => {
    const pinlabelAnchorSide = determinePinlabelAnchorSide(data);
    return {
      ...data,
      pinlabelAnchorSide,
      male: data.male ?? !data.female,
      female: data.female ?? false,
      smd: data.smd ?? data.surfacemount ?? false,
      rightangle: data.rightangle ?? false,
    };
  })
  .superRefine((data, ctx) => {
    if (data.male && data.female) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "'male' and 'female' cannot both be true; it should be male or female.",
        path: ["male", "female"],
      });
    }
    if (
      data.cols !== undefined &&
      (!Number.isInteger(data.cols) || data.cols < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "'cols' must be a positive integer",
        path: ["cols"],
      });
    }
    if (data.missing.some((position) => typeof position !== "number")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "'missing' positions must be pad numbers",
        path: ["missing"],
      });
    }
  });

export const pinrow = (
  raw_params: z.input<typeof pinrow_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = pinrow_def.parse(raw_params);
  const {
    p,
    py,
    id,
    od,
    rows,
    cols,
    num_pins,
    missing,
    pinlabelAnchorSide,
    pinlabelverticallyinverted,
    pinlabelorthogonal,
    pinlabeltextalignleft,
    pinlabeltextalignright,
    nopinlabels,
    doublesidedpinlabel,
    bottomsidepinlabel,
    silkscreenborder,
    silkscreenlabel,
  } = parameters;
  let pinlabelTextAlign: "center" | "left" | "right" = "center";
  if (pinlabeltextalignleft) pinlabelTextAlign = "left";
  else if (pinlabeltextalignright) pinlabelTextAlign = "right";

  const holes: AnyCircuitElement[] = [];
  let pin1Position: { x: number; y: number } | null = null;
  const missingPositions = missing as number[];
  const uniqueMissingPositions = new Set(missingPositions);
  if (uniqueMissingPositions.size !== missingPositions.length) {
    throw new Error("Pinrow missing positions must not contain duplicates");
  }
  const nominalPinCount = num_pins + missingPositions.length;
  const numPinsPerRow = cols ?? Math.ceil(nominalPinCount / rows);
  const gridPositionCount = numPinsPerRow * rows;
  const usesExplicitGrid = cols !== undefined || missingPositions.length > 0;
  if (usesExplicitGrid && gridPositionCount !== nominalPinCount) {
    throw new Error(
      `Pinrow grid has ${gridPositionCount} positions, but ${nominalPinCount} are required for ${num_pins} pins and ${missingPositions.length} missing positions`,
    );
  }
  if (
    missingPositions.some(
      (position) =>
        !Number.isInteger(position) ||
        position < 1 ||
        position > gridPositionCount,
    )
  ) {
    throw new Error("Pinrow missing position is outside the nominal grid");
  }
  const rowPitch = py ?? p;
  const pinRowSpanY = (rows - 1) * rowPitch;
  const yStart = pinRowSpanY / 2;
  const ySpacing = -rowPitch;

  const calculateAnchorPosition = ({
    xoff,
    yoff,
    od,
    anchorSide,
    smd,
    pw,
    pl,
  }: {
    xoff: number;
    yoff: number;
    od: number;
    anchorSide: "top" | "bottom" | "left" | "right";
    smd: boolean;
    pw: number;
    pl: number;
  }): { anchor_x: number; anchor_y: number } => {
    let dx = 0;
    let dy = 0;
    if (smd) {
      const offset = od / 5;
      switch (anchorSide) {
        case "right":
          dx = pw / 2 + offset;
          break;
        case "top":
          dy = pl / 2 + offset;
          break;
        case "bottom":
          dy = -(pl / 2 + offset);
          break;
        case "left":
          dx = -(pw / 2 + offset);
          break;
      }
    } else {
      // Keep through-hole pin labels beyond the outer edge of the plating.
      // A fixed clearance remains effective for every supported pad diameter.
      const offset = od / 2 + 0.6;
      switch (anchorSide) {
        case "right":
          dx = offset;
          break;
        case "top":
          dy = offset;
          break;
        case "bottom":
          dy = -offset;
          break;
        case "left":
          dx = -offset;
          break;
      }
    }
    return { anchor_x: xoff + dx, anchor_y: yoff + dy };
  };

  // Helper to add plated hole and silkscreen label
  const addPin = (pinNumber: number, xoff: number, yoff: number) => {
    if (pinNumber === 1) pin1Position = { x: xoff, y: yoff };
    if (parameters.smd) {
      // SMD pads
      holes.push(rectpad(pinNumber, xoff, yoff, parameters.pw, parameters.pl));
    } else {
      // Through-hole
      if (pinNumber === 1 && !parameters.nosquareplating) {
        // Always use square plating for pin 1 (no need to check nosquareplating anymore)
        holes.push(
          platedHoleWithRectPad({
            pn: pinNumber,
            x: xoff,
            y: yoff,
            holeDiameter: id,
            rectPadWidth: od,
            rectPadHeight: od,
          }),
        );
      } else {
        // Other pins with standard circular pad
        holes.push(platedhole(pinNumber, xoff, yoff, id, od));
      }
    }
    const { anchor_x, anchor_y } = calculateAnchorPosition({
      xoff,
      yoff,
      od,
      anchorSide: pinlabelAnchorSide,
      smd: parameters.smd,
      pw: parameters.pw,
      pl: parameters.pl,
    });
    if (!nopinlabels) {
      if (!bottomsidepinlabel) {
        holes.push(
          silkscreenPin({
            fs: od / 5,
            pn: pinNumber,
            anchor_x,
            anchor_y,
            anchorplacement: pinlabelAnchorSide,
            textalign: pinlabelTextAlign,
            orthogonal: pinlabelorthogonal,
            verticallyinverted: pinlabelverticallyinverted,
            layer: "top",
          }),
        );
      } else {
        holes.push(
          silkscreenPin({
            fs: od / 5,
            pn: pinNumber,
            anchor_x,
            anchor_y,
            anchorplacement: pinlabelAnchorSide,
            textalign: pinlabelTextAlign,
            orthogonal: pinlabelorthogonal,
            verticallyinverted: pinlabelverticallyinverted,
            layer: "bottom",
          }),
        );
      }
      if (doublesidedpinlabel) {
        holes.push(
          silkscreenPin({
            fs: od / 5,
            pn: pinNumber,
            anchor_x,
            anchor_y,
            anchorplacement: pinlabelAnchorSide,
            textalign: pinlabelTextAlign,
            orthogonal: pinlabelorthogonal,
            verticallyinverted: pinlabelverticallyinverted,
            layer: "bottom",
          }),
        );
      }
    }
  };

  // Track used positions to prevent overlaps
  const usedPositions = new Set<string>();

  if (usesExplicitGrid) {
    // Explicit grids use row-major nominal positions. Missing positions do not
    // consume output pin numbers, so generated port hints remain contiguous.
    const xStart = -((numPinsPerRow - 1) / 2) * p;
    let outputPinNumber = 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < numPinsPerRow; col++) {
        const nominalPosition = row * numPinsPerRow + col + 1;
        if (uniqueMissingPositions.has(nominalPosition)) continue;
        const xoff = xStart + col * p;
        const yoff = yStart + row * ySpacing;
        const posKey = `${xoff},${yoff}`;
        if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`);
        usedPositions.add(posKey);
        addPin(outputPinNumber++, xoff, yoff);
      }
    }
  } else if (rows === 1) {
    // Single row: left to right, pin 1 to num_pins
    const xStart = -((num_pins - 1) / 2) * p;
    for (let i = 0; i < num_pins; i++) {
      const pinNumber = i + 1;
      const xoff = xStart + i * p;
      const posKey = `${xoff},${0}`;
      if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`);
      usedPositions.add(posKey);
      addPin(pinNumber, xoff, 0);
    }
  } else {
    // Check if BGA-style numbering should be used
    const useBGAStyle = rows > 2 && numPinsPerRow > 2;

    if (useBGAStyle) {
      // BGA-style: row-major numbering (left to right, top to bottom)
      const xStart = -((numPinsPerRow - 1) / 2) * p;
      let currentPin = 1;
      for (let row = 0; row < rows && currentPin <= num_pins; row++) {
        for (
          let col = 0;
          col < numPinsPerRow && currentPin <= num_pins;
          col++
        ) {
          const xoff = xStart + col * p;
          const yoff = yStart + row * ySpacing;
          const posKey = `${xoff},${yoff}`;
          if (usedPositions.has(posKey))
            throw new Error(`Overlap at ${posKey}`);
          usedPositions.add(posKey);
          addPin(currentPin++, xoff, yoff);
        }
      }
    } else {
      // Multi-row: counterclockwise spiral traversal
      const xStart = -((numPinsPerRow - 1) / 2) * p;
      let currentPin = 1;
      let top = 0;
      let bottom = rows - 1;
      let left = 0;
      let right = numPinsPerRow - 1;

      while (currentPin <= num_pins && top <= bottom && left <= right) {
        // Left column: top to bottom
        for (let row = top; row <= bottom && currentPin <= num_pins; row++) {
          const xoff = xStart + left * p;
          const yoff = yStart + row * ySpacing;
          const posKey = `${xoff},${yoff}`;
          if (usedPositions.has(posKey))
            throw new Error(`Overlap at ${posKey}`);
          usedPositions.add(posKey);
          addPin(currentPin++, xoff, yoff);
        }
        left++;

        // Bottom row: left to right
        for (let col = left; col <= right && currentPin <= num_pins; col++) {
          const xoff = xStart + col * p;
          const yoff = yStart + bottom * ySpacing;
          const posKey = `${xoff},${yoff}`;
          if (usedPositions.has(posKey))
            throw new Error(`Overlap at ${posKey}`);
          usedPositions.add(posKey);
          addPin(currentPin++, xoff, yoff);
        }
        bottom--;

        if (left <= right) {
          // Right column: bottom to top
          for (let row = bottom; row >= top && currentPin <= num_pins; row--) {
            const xoff = xStart + right * p;
            const yoff = yStart + row * ySpacing;
            const posKey = `${xoff},${yoff}`;
            if (usedPositions.has(posKey))
              throw new Error(`Overlap at ${posKey}`);
            usedPositions.add(posKey);
            addPin(currentPin++, xoff, yoff);
          }
          right--;
        }

        if (top <= bottom) {
          // Top row: right to left
          for (let col = right; col >= left && currentPin <= num_pins; col--) {
            const xoff = xStart + col * p;
            const yoff = yStart + top * ySpacing;
            const posKey = `${xoff},${yoff}`;
            if (usedPositions.has(posKey))
              throw new Error(`Overlap at ${posKey}`);
            usedPositions.add(posKey);
            addPin(currentPin++, xoff, yoff);
          }
          top++;
        }
      }

      // Verify all pins were assigned
      if (currentPin - 1 < num_pins) {
        throw new Error(
          `Missing pins: assigned ${currentPin - 1}, expected ${num_pins}`,
        );
      }
    }
  }

  const padHalfWidth = parameters.smd ? parameters.pw / 2 : od / 2;
  const padHalfHeight = parameters.smd ? parameters.pl / 2 : od / 2;
  const pinRowSpanX = (numPinsPerRow - 1) * p;
  const silkscreenHalfWidth = pinRowSpanX / 2 + p / 2 + 1;
  const silkscreenHalfHeight = Math.max(
    pinRowSpanY / 2 + padHalfHeight + 1,
    p / 2 + 1,
  );
  const silkscreenBorder = silkscreenborder
    ? silkscreenpath([
        { x: -silkscreenHalfWidth, y: -silkscreenHalfHeight },
        { x: silkscreenHalfWidth, y: -silkscreenHalfHeight },
        { x: silkscreenHalfWidth, y: silkscreenHalfHeight },
        { x: -silkscreenHalfWidth, y: silkscreenHalfHeight },
        { x: -silkscreenHalfWidth, y: -silkscreenHalfHeight },
      ])
    : null;

  const pin1Arrow = (() => {
    if (parameters.fn !== "headermodule" || !pin1Position) return null;

    const arrowSize = Math.max(0.3, Math.min(0.6, p / 4));
    const clearance = 0.15;
    const horizontal =
      pinlabelAnchorSide === "top" || pinlabelAnchorSide === "bottom";

    if (horizontal) {
      const direction =
        Math.sign(pin1Position.x) || (pinlabelAnchorSide === "top" ? -1 : 1);
      const tipX = pin1Position.x + direction * (padHalfWidth + clearance);
      const baseX = tipX + direction * arrowSize;
      return silkscreenpath(
        [
          { x: tipX, y: pin1Position.y },
          { x: baseX, y: pin1Position.y - arrowSize },
          { x: baseX, y: pin1Position.y + arrowSize },
          { x: tipX, y: pin1Position.y },
        ],
        {
          pcb_component_id: "pin_marker_1",
          pcb_silkscreen_path_id: "pin_marker_1",
        },
      );
    }

    const direction = Math.sign(pin1Position.y) || 1;
    const tipY = pin1Position.y + direction * (padHalfHeight + clearance);
    const baseY = tipY + direction * arrowSize;
    return silkscreenpath(
      [
        { x: pin1Position.x, y: tipY },
        { x: pin1Position.x - arrowSize, y: baseY },
        { x: pin1Position.x + arrowSize, y: baseY },
        { x: pin1Position.x, y: tipY },
      ],
      {
        pcb_component_id: "pin_marker_1",
        pcb_silkscreen_path_id: "pin_marker_1",
      },
    );
  })();

  // Add centered silkscreen reference text or an explicit module label.
  const refText: SilkscreenRef = silkscreenlabel
    ? {
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: "silkscreen_text_1",
        font: "tscircuit2024",
        font_size: 0.8,
        pcb_component_id: "pcb_component_1",
        text: silkscreenlabel,
        layer: "top",
        anchor_position: { x: 0, y: 0 },
        anchor_alignment: "center",
      }
    : silkscreenRef(0, pinRowSpanY / 2 + p, 0.5);

  const padOuterHalfWidth = pinRowSpanX / 2 + padHalfWidth;
  const padOuterHalfHeight = pinRowSpanY / 2 + padHalfHeight;
  const bodyHalfWidth = pinRowSpanX / 2 + p / 2;
  const bodyHalfHeight = pinRowSpanY / 2 + p / 2;
  const courtyardHalfWidth = Math.max(
    padOuterHalfWidth + 0.25,
    bodyHalfWidth + 0.5,
  );
  const courtyardHalfHeight = Math.max(
    padOuterHalfHeight + 0.25,
    bodyHalfHeight + 0.5,
  );
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: 2 * courtyardHalfWidth,
    height: 2 * courtyardHalfHeight,
    layer: "top",
  };

  return {
    circuitJson: [
      ...holes,
      ...(silkscreenBorder ? [silkscreenBorder] : []),
      ...(pin1Arrow ? [pin1Arrow] : []),
      refText,
      courtyard as AnyCircuitElement,
    ],
    parameters,
  };
};
