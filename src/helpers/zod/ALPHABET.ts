export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

/**
 * Return a row label for a zero-based row index, extending beyond Z
 * with double letters (AA, AB, …, AZ, BA, …).
 *
 *   Rows  0–25  → A … Z   (single letter, same as ALPHABET)
 *   Rows 26–51  → AA … AZ
 *   Rows 52–77  → BA … BZ
 *   … and so on.
 *
 * This keeps backwards compatibility with the existing A–Z labeling
 * while supporting large BGA packages (>26 rows).
 */
export function bgaRowLabel(row: number): string {
  if (row < 26) {
    return ALPHABET[row]!
  }

  const groupIndex = Math.floor((row - 26) / 26)
  const letterIndex = (row - 26) % 26
  return `${ALPHABET[groupIndex]}${ALPHABET[letterIndex]}`
}
