import andrewtate from "../../lib/canvas/andrewtate";
import spotify from "../../lib/canvas/spotify";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "thisis",
    name: "This Is",
    desc: "Creates a Spotify 'This Is' image.",
    needs: ["image"],
    aliases: ["spotify"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            spotify(buf[0][0], args.join(" ")).then((out) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        out,
                        getFileName("Canvas_Spotify", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
