const COURTYARD_CLEARANCE_MM = 0.25

export const getBodyBasedCourtyardSize = ({
  bodyWidth,
  bodyHeight,
  padEnvelopeWidth,
  padEnvelopeHeight,
}: {
  bodyWidth: number
  bodyHeight: number
  padEnvelopeWidth: number
  padEnvelopeHeight: number
}) => ({
  width: Math.max(bodyWidth, padEnvelopeWidth) + 2 * COURTYARD_CLEARANCE_MM,
  height: Math.max(bodyHeight, padEnvelopeHeight) + 2 * COURTYARD_CLEARANCE_MM,
})
