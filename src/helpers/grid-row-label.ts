/** JEDEC package-coordinate alphabet, excluding I, O, Q, S, X, and Z. */
export const BGA_ROW_ALPHABET = "ABCDEFGHJKLMNPRTUVWY"

export const getGridRowLabel = (
  row: number,
  alphabet = BGA_ROW_ALPHABET,
): string => {
  let remaining = row + 1
  let label = ""
  while (remaining > 0) {
    remaining--
    label = alphabet[remaining % alphabet.length] + label
    remaining = Math.floor(remaining / alphabet.length)
  }
  return label
}
