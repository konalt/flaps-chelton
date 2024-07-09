import { FlapsCommand } from "../../types";
import gameplay from "../../lib/ffmpeg/gameplay";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName } from "../../lib/utils";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { sendWebhook } from "../../lib/webhooks";

module.exports = {
    id: "gameplay",
    name: "GAMEPLAY!",
    desc: "'bro touhou is so good tho' the gameplay:",
    needs: ["image"],
    async execute(args, buffers, msg) {
        return new Promise((res) => {
            if (msg) {
                sendWebhook(
                    "ffmpeg",
                    "Fair warning, this command can take up to 3 minutes to finish running. See you then lol",
                    msg.channel
                );
            }
            gameplay(buffers, args[0] == "--highres").then(
                handleFFmpeg(getFileName("Effect_Gameplay", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
