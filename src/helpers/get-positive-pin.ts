export const getPositivePin = (parameters: {
  positivepin?: number
  negativepin?: number
}): 1 | 2 => {
  if (
    parameters.positivepin !== undefined &&
    parameters.positivepin === parameters.negativepin
  ) {
    throw new Error("Positive and negative terminals cannot use the same pin")
  }
  return (parameters.positivepin ?? (parameters.negativepin === 1 ? 2 : 1)) as
    | 1
    | 2
}
