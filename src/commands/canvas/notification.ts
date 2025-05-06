import notification from "../../lib/canvas/notification";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "notification",
    name: "Notification",
    desc: "Creates a fake Discord notification.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await notification(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Notification", "png")
        );
    },
} satisfies FlapsCommand;
