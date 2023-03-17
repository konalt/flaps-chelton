import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import busting from "../../lib/ffmpeg/busting";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "busting",
    name: "Busting",
    desc: "Makes Ben Shaprio almost bust to something",
    needs: ["video"],
    aliases: ["bust", "benbust"],
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            busting(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Busting", getFileExt(buf[0][1])),
                    msg.channel as TextChannel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
