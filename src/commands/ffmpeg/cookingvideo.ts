import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { cookingVideo } from "../../lib/ffmpeg/cookingvideo";

module.exports = {
    id: "cookingvideo",
    name: "Cooking Video",
    desc: "Fades in a jumpscare on a cooking video.",
    needs: ["image"],
    execute(args, buf, msg) {
        cookingVideo(buf).then(
            handleFFmpeg(
                getFileName("Effect_CookingVideo", "mp4"),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
