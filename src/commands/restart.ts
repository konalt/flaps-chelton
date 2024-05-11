import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "restart",
    name: "Restart",
    desc: "Restarts flaps.",
    async execute() {
        setTimeout(() => {
            process.exit(0);
        }, 1000);
        return makeMessageResp("flaps", "IM DYING");
    },
} satisfies FlapsCommand;
