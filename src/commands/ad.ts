import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "ad",
    name: "Auto-Delete",
    desc: "Immediately deletes your message.",
    async execute(_a, _b, msg) {
        return new Promise(async (res, rej) => {
            msg.delete();
            res(makeMessageResp("flaps", ""));
        });
    },
} satisfies FlapsCommand;
