import { z } from "zod";
export const pin_order_specifier = z.enum([
    "leftside",
    "topside",
    "rightside",
    "bottomside",
    "toppin",
    "bottompin",
    "leftpin",
    "rightpin",
]);
