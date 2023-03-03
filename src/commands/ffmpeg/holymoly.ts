import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { cookingVideo } from "../../lib/ffmpeg/cookingvideo";
import holymoly from "../../lib/ffmpeg/holymoly";

module.exports = {
    id: "holymoly",
    name: "Holy Moly",
    desc: "Makes a guy say Holy Moly.",
    needs: ["image"],
    execute(args, buf, msg) {
        holymoly(buf).then(
            handleFFmpeg(
                getFileName("Effect_CookingVideo", "mp4"),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
