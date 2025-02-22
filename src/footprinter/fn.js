export const sot223 = (params) => ({
    circuitJson: () => [{ type: "sot223", params }],
    parameters: params
});
export const FOOTPRINT_FN = {
    dip,
    qfp,
    sot223,
};
