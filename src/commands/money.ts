import { readFileSync } from "fs";
import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "money",
    name: "Infinite Money",
    aliases: ["infinitemoney"],
    desc: "Gives you money",
    async execute() {
        return makeMessageResp(
            "flaps",
            "",
            readFileSync("images/money.jpg"),
            "img.png"
        );
    },
} satisfies FlapsCommand;
