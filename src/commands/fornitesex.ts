import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import fetch from "node-fetch";

module.exports = {
    id: "fornitesex",
    name: "Fornite Sex",
    desc: "Gets the current subscriber of r/fornitesex",
    async execute() {
        let resp = await fetch(
            "https://www.reddit.com/r/fornitesex/about.json"
        ).then((r) => {
            return r.json();
        });
        return makeMessageResp(
            "flaps",
            `r/fornitesex has ${resp.data.subscribers} members! wowie!!`
        );
    },
} satisfies FlapsCommand;
