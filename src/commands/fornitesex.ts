import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import fetch from "node-fetch";

module.exports = {
    id: "fornitesex",
    name: "Fornite Sex",
    desc: "Gets the current subscriber of r/fornitesex",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            fetch("https://www.reddit.com/r/fornitesex/about.json")
                .then((r) => {
                    return r.json();
                })
                .then((r) => {
                    res(
                        makeMessageResp(
                            "flaps",
                            `r/fornitesex has ${r.data.subscribers} members! wowie!!`
                        )
                    );
                });
        });
    },
} satisfies FlapsCommand;
