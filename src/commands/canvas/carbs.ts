import carbs from "../../lib/canvas/carbs";
import homodog from "../../lib/canvas/homodog";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "carbs",
    name: "Carbs",
    desc: "Carbs against Hubaniby",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            carbs(args[0] == "funny").then((out) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        msg.channel,
                        out,
                        getFileName("Canvas_Carbs", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
