/**
 * tscircuit - smd-passives-0402-0805
 */
export function getSmdPassive(size: "0402"|"0603"|"0805") { return { size, padGap: 0.5 }; }
