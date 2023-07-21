import confucius from "../../lib/canvas/confucius";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "confucius",
    name: "Confucius",
    desc: "Creates a wise Chinese philosopher",
    aliases: ["china"], // confucius is hard to type ok
    execute(args) {
        return new Promise((res, rej) => {
            confucius(args.join(" ")).then((out) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        out,
                        getFileName("Canvas_Confucius", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
