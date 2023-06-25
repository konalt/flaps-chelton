import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import fetch from "node-fetch";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "funnynumber",
    name: "Funny Number",
    desc: "Gets the funny number of a character.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            var x = "";
            var noformat = false;
            if (args.includes("--noformat")) {
                noformat = true;
                args = args.filter((a) => a != "--noformat");
            }
            if (args[0]) {
                x = args.join("_");
            } else {
                x = "calamitas".split(" ").join("_");
            }
            fetch(
                "https://rule34.xxx/public/autocomplete.php?q=" +
                    x.replace(/'/g, "&#039;"),
                {
                    headers: {
                        "User-Agent": "FlapsChelton",
                        Accept: "*/*",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                    },
                    method: "GET",
                }
            )
                .then((r) => {
                    return r.json();
                })
                .then((r) => {
                    var y = "";
                    if (!r[0]) {
                        res(
                            makeMessageResp(
                                "runcling",
                                "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude."
                            )
                        );
                    } else {
                        r = r.filter((z) =>
                            z.label.replace(/&#039;/g, "'").startsWith(x)
                        );
                        if (!r[0]) {
                            return res(
                                makeMessageResp(
                                    "runcling",
                                    "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude."
                                )
                            );
                        }
                        var data = {};
                        r.forEach((z) => {
                            data[z.value] = parseInt(
                                z.label.substring(
                                    z.value.length + 2,
                                    z.label.length - 1
                                )
                            );
                        });
                        y = r
                            .map((z) => {
                                if (noformat) {
                                    return (
                                        x +
                                        z.label
                                            .replace(/&#039;/g, "'")
                                            .substring(x.length)
                                    );
                                } else {
                                    return (
                                        "**" +
                                        x +
                                        "**" +
                                        z.label
                                            .replace(/&#039;/g, "'")
                                            .substring(x.length)
                                            .replace(/_/g, "\\_")
                                    );
                                }
                            })
                            .join("\n");
                    }

                    res(makeMessageResp("runcling", y));
                });
        });
    },
} satisfies FlapsCommand;
