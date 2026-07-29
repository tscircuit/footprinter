import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { solderjumper } from "../src/fn/solderjumper"

// These values (p=1.0414, pw=0.6604) are from the SparkFun Qwiic ToF Imager
// VL53L5CX board. They are NOT exactly representable in IEEE 754 binary FP,
// which triggers the compound error in the bridge trace endpoint calculation.
test.failing(
  "solderjumper bridge trace endpoint lands inside pad (FP precision)",
  () => {
    const result = solderjumper({
      num_pins: 3,
      bridged: "123",
      p: 1.0414,
      pw: 0.6604,
      ph: 1.27,
    })

    const pads = result.circuitJson.filter((e: any) => e.type === "pcb_smtpad")
    const traces = result.circuitJson.filter((e: any) => e.type === "pcb_trace")

    const trace = traces[0] as any
    const pad2 = pads.find((p: any) => p.port_hints?.includes("2"))!
    const halfWidth = 0.6604 / 2

    const svg = convertCircuitJsonToPcbSvg(result.circuitJson)
    expect(svg).toMatchSvgSnapshot(
      import.meta.path,
      "solderjumper3_bridged123_p1.0414_pw0.6604_ph1.27",
    )

    // The endpoint at the pad edge should be within the pad boundary
    // This fails because 1.0414 - 0.3302 = 0.7112 has a compound FP error
    // making |0.7112 - 1.0414| = 0.33020000000000005 > 0.3302
    expect(Math.abs(trace.route[1].x - pad2.x)).toBeLessThanOrEqual(halfWidth)
  },
)
