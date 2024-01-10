import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
module.exports = {
    id: "yougoodslime",
    name: "You Good Slime?",
    desc: "Checks if flaps is good slime",
    execute() {
        return new Promise((res, rej) => {
            res(makeMessageResp("flaps", "im ok slime!"));
        });
    },
} satisfies FlapsCommand;
