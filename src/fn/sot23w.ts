import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"

// Define the default properties for the SOT23W package
export const sot23w_def = z.object({
  fn: z.string(), // Function name, typically used for identification
  num_pins: z.number().default(3), // Number of pins (default to 3 for SOT23W)
  w: z.string().default("5.40mm"), // Width of the package
  h: z.string().default("3.30mm"), // Height of the package
  pl: z.string().default("2mm"), // Pin length
  pw: z.string().default("0.7mm"), // Pin width
  p: z.string().default("3.40mm"), // Pin pitch (distance between pins)
  string: z.string().optional(), // Optional string parameter (e.g., SOT23W identifier)
})

// Main function to generate circuit elements based on input parameters
export const sot23w = (
  raw_params: z.input<typeof sot23w_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // Extract the number of pins from the string if available, fallback to 3 pins
  const match = raw_params.string?.match(/^sot23w_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 3) : 3

  // Parse the parameters and validate
  const parameters = sot23w_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  // Generate circuit JSON based on the number of pins
  if (parameters.num_pins === 3) {
    return {
      circuitJson: sot23w_3(parameters),
      parameters: parameters,
    }
  }

  // If the number of pins is not 3, throw an error (since we only handle 3-pin SOT23W)
  throw new Error("Invalid number of pins")
}

// Function to get the coordinates of pins based on package dimensions
export const getCcwSot23wCoords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  // Define specific pin positions based on the pin number (pn)
  if (pn === 1) {
    return { x: -p / 2, y: 0.95 } // Pin 1 position
  }
  if (pn === 2) {
    return { x: -p / 2, y: -0.95 } // Pin 2 position
  }

  return { x: p / 2, y: 0 } // Pin 3 position
}

// Function to create the pads for the SOT23W package with 3 pins
export const sot23w_3 = (parameters: z.infer<typeof sot23w_def>) => {
  const pads: AnyCircuitElement[] = []

  // Loop through the number of pins and calculate their positions
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSot23wCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      pl: Number.parseFloat(parameters.pl),
      p: Number.parseFloat(parameters.p),
    })
    pads.push(
      // Create a rectangle pad for each pin
      rectpad(
        i + 1,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
      ),
    )
  }

  // Generate the silkscreen reference for the component
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    Number.parseInt(parameters.h) / 2 + 1,
    0.3,
  )

  // Return the pads and the silkscreen reference as the final circuit elements
  const width = Number.parseFloat(parameters.w) / 2 - 1
  const height = Number.parseFloat(parameters.h) / 2
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width + 1.2, y: height },
      { x: width / 2 + 0.3, y: height },
      { x: width / 2 + 0.3, y: height / 2 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width + 1.2, y: -height },
      { x: width / 2 + 0.3, y: -height },
      { x: width / 2 + 0.3, y: -height / 2 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  return [
    ...pads,
    silkscreenPath1,
    silkscreenPath2,
    silkscreenRefText as AnyCircuitElement,
  ]
}
