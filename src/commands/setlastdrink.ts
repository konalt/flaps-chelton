import { FlapsCommand } from "../types";
import { writeFile } from "fs/promises";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "setlastdrink",
    name: "Set Last Drink",
    desc: "the fact that i had to add this is a testament to failure",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            writeFile("./lastdrink.txt", new Date().toISOString()).then(() => {
                res(makeMessageResp("flaps", "for fucks sake"));
            });
        });
    },
} satisfies FlapsCommand;
