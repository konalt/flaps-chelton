import speechbubble from "../../lib/canvas/speechbubble";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "speechbubble",
    name: "Speech Bubble",
    desc: "Places a speech bubble on an image",
    needs: ["image"],
    aliases: ["sb"],
    async execute(args, imgbuf) {
        let out = await speechbubble(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_SpeechBubble", "png")
        );
    },
} satisfies FlapsCommand;
