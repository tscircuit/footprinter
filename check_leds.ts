import { led2835 } from "./src/fn/led2835"
import { led5050 } from "./src/fn/led5050"
import { lpcc } from "./src/fn/lpcc"

console.log("LED 2835:")
console.log(JSON.stringify(led2835({}), null, 2))

console.log("\nLED 5050:")
console.log(JSON.stringify(led5050({}), null, 2))

console.log("\nLPCC-32:")
console.log(JSON.stringify(lpcc({ num_pins: 32, w: 5, h: 5, p: 0.5 }), null, 2))
