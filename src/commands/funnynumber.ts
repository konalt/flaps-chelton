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
            if (args[0]) {
                x = args.join("_");
            } else {
                x = "calamitas".split(" ").join("_");
            }
            if (x.includes("child")) {
                return sendWebhook(
                    "runcling",
                    "🚔🚔🚔🚔🚨🚨🚨🚨🚨🚓🚓🚓🚓👮‍♀️👮‍♂️👮‍♂️👮‍♂️👮‍♂️👮👮‍♂️👮‍♂️🚓🚨👮‍♀️👮‍♂️👮‍♀️🚓🚔🚨",
                    msg.channel
                );
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
                        sendWebhook(
                            "runcling",
                            "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude.",
                            msg.channel
                        );
                    } else {
                        r = r.filter((z) =>
                            z.label.replace(/&#039;/g, "'").startsWith(x)
                        );
                        if (!r[0]) {
                            return sendWebhook(
                                "runcling",
                                "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude.",
                                msg.channel
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
                                return (
                                    "**" +
                                    x +
                                    "**" +
                                    z.label
                                        .replace(/&#039;/g, "'")
                                        .substring(x.length)
                                        .replace(/_/g, "\\_")
                                );
                            })
                            .join("\n");
                    }

                    res(makeMessageResp("runcling", y, msg.channel));
                });
        });
    },
} satisfies FlapsCommand;
