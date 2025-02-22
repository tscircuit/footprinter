export const sot223 = (params: any) => ({
  circuitJson: () => [{ type: "sot223", params }],
  parameters: params
});

export const FOOTPRINT_FN: Record<string, Function> = {
  dip,
  qfp,
  sot223, 
};
