import {
	length,
	type AnySoupElement,
	type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { platedHoleWithRectPad } from "src/helpers/platedHoleWithRectPad"
import { base_def } from "../helpers/zod/base_def"

export const gbj_def = base_def.extend({
	fn: z.string(),
	p1: length.default("10mm"),
	p2: length.default("7.5mm"),
	id: length.default("1.8mm"),
	od: length.default("3.5mm"),
	w: length.default("30mm"),
	h: length.default("4.8mm"),
})

export type gbjDef = z.input<typeof gbj_def>

export const gbj = (
	raw_params: gbjDef,
): { circuitJson: AnySoupElement[]; parameters: any } => {
	const params = gbj_def.parse(raw_params)

	const pads: AnySoupElement[] = []

	const x1 = -12.5
	const x2 = x1 + params.p1
	const x3 = x2 + params.p2
	const x4 = x3 + params.p2

	const positions = [x1, x2, x3, x4]

	positions.forEach((x, index) => {
		const pinNumber = index + 1
		if (pinNumber === 1) {
			pads.push(
				platedHoleWithRectPad(pinNumber, x, 0, params.id, params.od, params.od),
			)
		} else {
			pads.push(platedhole(pinNumber, x, 0, params.id, params.od))
		}
	})

	const silkBody: PcbSilkscreenPath = {
		type: "pcb_silkscreen_path",
		layer: "top",
		pcb_component_id: "",
		pcb_silkscreen_path_id: "",
		stroke_width: 0.1,
		route: [
			{ x: -params.w / 2, y: -params.h / 2 },
			{ x: params.w / 2, y: -params.h / 2 },
			{ x: params.w / 2, y: params.h / 2 },
			{ x: -params.w / 2, y: params.h / 2 },
			{ x: -params.w / 2, y: -params.h / 2 },
		],
	}

	const silkPlus: PcbSilkscreenPath = {
		type: "pcb_silkscreen_path",
		layer: "top",
		pcb_component_id: "",
		pcb_silkscreen_path_id: "",
		stroke_width: 0.1,
		route: [
			{ x: x1 - 2, y: 0 },
			{ x: x1 - 1, y: 0 },
			{ x: x1 - 1.5, y: -0.5 },
			{ x: x1 - 1.5, y: 0.5 },
		],
	}

	return {
		circuitJson: [...pads, silkBody, silkPlus],
		parameters: params,
	}
}