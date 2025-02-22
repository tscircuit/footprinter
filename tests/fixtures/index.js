export { getTestFixture } from "./get-test-fixture";
export const toPinPositionString = (soup) => {
    return soup
        .map((e) => {
        if (e.type === "pcb_plated_hole") {
            return {
                x: e.x,
                y: e.y,
                pn: e.port_hints?.[0],
            };
        }
        else if (e.type === "pcb_smtpad") {
            return {
                x: e.x,
                y: e.y,
                pn: e.port_hints?.[0],
            };
        }
        // TODO other types
    })
        .filter(Boolean)
        .sort((a, b) => a.pn - b.pn)
        .map((e) => `${e.pn.padEnd(2)}: ${e.x.toFixed(2).padStart(5)} ${e.y
        .toFixed(2)
        .padStart(5)}`)
        .join("\n");
};
