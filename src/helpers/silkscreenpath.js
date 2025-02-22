export const silkscreenpath = (route, options = {}) => {
    return {
        type: "pcb_silkscreen_path",
        layer: options.layer || "top",
        pcb_component_id: options.pcb_component_id || "",
        pcb_silkscreen_path_id: options.pcb_silkscreen_path_id || "",
        route,
        stroke_width: options.stroke_width || 0.1,
    };
};
