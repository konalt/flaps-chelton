import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import {
    getFileExt,
    getFileName,
    getFunctionName,
    getTypeSingular,
} from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import { lookup } from "mime-types";
import stitch from "../../lib/ffmpeg/stitch";
import stitchaudio from "../../lib/ffmpeg/stitchaudio";
import stitchgif from "../../lib/ffmpeg/stitchgif";
import imageaudio from "../../lib/ffmpeg/imageaudio";
import audioimage from "../../lib/ffmpeg/audioimage";
import audiovideo from "../../lib/ffmpeg/audiovideo";
import videoaudio from "../../lib/ffmpeg/videoaudio";
import gifaudio from "../../lib/ffmpeg/gifaudio";
import audiogif from "../../lib/ffmpeg/audiogif";
import stack from "../../lib/ffmpeg/stack";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { Color, esc, log } from "../../lib/logger";

function combineOperation(
    type1: string,
    type2: string
): ((bufs: [Buffer, string][]) => Promise<Buffer>) | null {
    switch (type1) {
        case "image":
            switch (type2) {
                case "image":
                    return stack;
                case "video":
                    return imageaudio;
                case "audio":
                    return imageaudio;
                case "gif":
                    return null;
            }
            return null;
        case "video":
            switch (type2) {
                case "image":
                    return stack;
                case "video":
                    return stitch;
                case "audio":
                    return videoaudio;
                case "gif":
                    return null;
            }
            return null;
        case "audio":
            switch (type2) {
                case "image":
                    return audioimage;
                case "video":
                    return audiovideo;
                case "audio":
                    return stitchaudio;
                case "gif":
                    return audiogif;
            }
            return null;
        case "gif":
            switch (type2) {
                case "image":
                    return null;
                case "video":
                    return null;
                case "audio":
                    return gifaudio;
                case "gif":
                    return stitchgif;
            }
            return null;
    }
}

function combineExt(type1: string, type2: string): string {
    switch (type1) {
        case "image":
            switch (type2) {
                case "image":
                    return "png";
                case "video":
                    return "mp4";
                case "audio":
                    return "mp4";
                case "gif":
                    return null;
            }
            return null;
        case "video":
            switch (type2) {
                case "image":
                    return "mp4";
                case "video":
                    return "mp4";
                case "audio":
                    return "mp4";
                case "gif":
                    return null;
            }
            return null;
        case "audio":
            switch (type2) {
                case "image":
                    return "mp4";
                case "video":
                    return "mp4";
                case "audio":
                    return "mp3";
                case "gif":
                    return "mp4";
            }
            return null;
        case "gif":
            switch (type2) {
                case "image":
                    return null;
                case "video":
                    return null;
                case "audio":
                    return "mp4";
                case "gif":
                    return "gif";
            }
            return null;
    }
}

module.exports = {
    id: "combine",
    name: "Combine",
    desc: "Combines two files. See how TODAY in src/commands/ffmpeg/combine.ts#combineOperation!",
    needs: ["image/video/audio/gif", "image/video/audio/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            let type1 = getTypeSingular(lookup(buffers[0][1]) || "text/plain");
            let type2 = getTypeSingular(lookup(buffers[1][1]) || "text/plain");

            let op = combineOperation(type1, type2);

            log(
                `${esc(Color.White)}Using combine function ${esc(
                    Color.BrightBlue
                )}${getFunctionName(op)}`,
                "combine"
            );

            if (op == null) {
                return sendWebhook(
                    "ffmpeg",
                    `how do you expect me to combine ${type1} and ${type2}`,
                    msg.channel
                );
            }

            op(buffers).then(
                handleFFmpeg(
                    getFileName("Effect_Combine", combineExt(type1, type2)),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
