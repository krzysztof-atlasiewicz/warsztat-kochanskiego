import { readFileSync } from "node:fs";
export default JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
