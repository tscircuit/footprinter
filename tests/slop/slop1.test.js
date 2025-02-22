import { describe, it, expect } from "bun:test"; // Bun's test utilities
import { getTestFixture } from "../fixtures"; // Adjust path based on your structure
// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export const SLOP_LIST = [
    "dip3",
    "bga64",
    "bga48",
    "bga48_grid8x8",
    "bga48_p2_pad0.2",
    "qfn32_p0.5mm",
    "pad_w2_h1",
];
describe("Slop Tests", () => {
    it("should handle slop elements correctly", async () => {
        const { fp, logSoupWithPrefix } = await getTestFixture("slop1");
        const soups = [];
        const failures = [];
        for (const slop of SLOP_LIST) {
            try {
                const soup = fp.string(slop).soup();
                soups.push(soup);
                if (slop === SLOP_LIST[SLOP_LIST.length - 1]) {
                    await logSoupWithPrefix(slop, soup);
                }
            }
            catch (e) {
                failures.push({
                    slop_string: slop,
                    error: e,
                });
                throw console.error(e);
            }
        }
        // Check if there were any failures and log the message
        if (failures.length > 0) {
            throw new Error(`Failures:\n${failures.map((f) => f.slop_string).join("\n")}`);
            // biome-ignore lint/style/noUselessElse: <explanation>
        }
        else {
            expect(failures.length).toBe(0); // Assert that there are no failures
        }
    });
});
