import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "ad",
    name: "Auto-Delete",
    desc: "Immediately deletes your message.",
    showOnCommandSimulator: false,
    async execute(_a, _b, msg) {
        setTimeout(() => {
            msg.delete();
        }, 1000);
        return makeMessageResp("flaps", "");
    },
} satisfies FlapsCommand;
