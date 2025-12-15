import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("gbj standard footprint", () => {
	const circuitJson = fp.string("gbj").circuitJson()

	const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

	expect(svgContent).toMatchSvgSnapshot(import.meta.path + "gbj")
})