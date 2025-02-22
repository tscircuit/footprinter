export const rectpad = (pn, x, y, w, h) => {
    return {
        type: "pcb_smtpad",
        x,
        y,
        width: w,
        height: h,
        layer: "top",
        shape: "rect",
        pcb_smtpad_id: "",
        port_hints: Array.isArray(pn)
            ? pn.map((item) => item.toString())
            : [pn.toString()],
    };
};
