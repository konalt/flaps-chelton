import { FFmpegPercentUpdate, FlapsCommand } from "../../types";
import gameplay from "../../lib/ffmpeg/gameplay";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName } from "../../lib/utils";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { editWebhookMessage, sendWebhook } from "../../lib/webhooks";

function progressBar(percent: number, characters: number) {
    let filled = Math.floor((percent / 100) * characters);
    return (
        "`[" +
        "█".repeat(filled) +
        "-".repeat(characters - filled) +
        "]`" +
        Math.floor(percent).toString() +
        "% complete"
    );
}

module.exports = {
    id: "gameplay",
    name: "GAMEPLAY!",
    desc: "'bro touhou is so good tho' the gameplay:",
    needs: ["image"],
    async execute(args, buffers, msg) {
        return new Promise(async (res) => {
            let msgid = "";
            if (msg) {
                msgid = await sendWebhook(
                    "ffmpeg",
                    `Rendering...\n${progressBar(0, 60)}`,
                    msg.channel
                );
            }
            let last = 0;
            let update = (update: FFmpegPercentUpdate) => {
                if (!msg) return;
                if (update.percent - last < 4) return;
                editWebhookMessage(
                    msgid,
                    "ffmpeg",
                    `Rendering...\n${progressBar(update.percent, 60)}`,
                    msg.channel
                );
                last = update.percent;
            };
            gameplay(buffers, args[0] == "--highres", update).then((v) => {
                if (msg) {
                    editWebhookMessage(
                        msgid,
                        "ffmpeg",
                        `ARE YOU READY TO RUMBLE\n${progressBar(100, 60)}`,
                        msg.channel
                    );
                }
                handleFFmpeg(getFileName("Effect_Gameplay", "mp4"), res)(v);
            }, handleFFmpegCatch(res));
        });
    },
} satisfies FlapsCommand;
