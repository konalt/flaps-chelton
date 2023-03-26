import fakenews from "../../lib/canvas/fakenews";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "fakenews",
    name: "Fake News",
    desc: "Creates a fake news screenshot.",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            fakenews(
                buf[0][0],
                args.join(" ").split(":")[0] || "news",
                args.join(" ").split(":")[1] || "hi"
            ).then((out) => {
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
