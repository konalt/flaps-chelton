import andrewtate from "../../lib/canvas/andrewtate";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "andrewtate",
    name: "Andrew Tate",
    desc: "ANDREW TATE has been BANNED from FLAPS CHELTON",
    needs: ["image"],
    aliases: ["tate"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            andrewtate(buf[0][0], args.join(" ")).then((out) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        out,
                        getFileName("Canvas_AndrewTate", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
