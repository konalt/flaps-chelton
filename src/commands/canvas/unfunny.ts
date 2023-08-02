import homodog from "../../lib/canvas/homodog";
import unfunny from "../../lib/canvas/unfunny";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "unfunny",
    name: "Unfunny",
    desc: "Replaces all the unfunny in an image with funny.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            unfunny(buf[0][0]).then((out) => {
                res(
                    makeMessageResp(
                        "saul",
                        "",
                        msg.channel,
                        out,
                        getFileName("Canvas_Homodog", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
