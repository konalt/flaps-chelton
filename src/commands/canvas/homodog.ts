import homodog from "../../lib/canvas/homodog";
import { getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "homodog",
    name: "Homophobic Dog",
    desc: "Not too fond...",
    needs: ["image?"],
    execute(args, buf, msg) {
        homodog(buf[0] ? buf[0][0] : null, args.join(" ")).then((out) => {
            sendWebhook(
                "flaps",
                "",
                msg.channel,
                out,
                getFileName("Canvas_Homodog", "png")
            );
        });
    },
} satisfies FlapsCommand;
