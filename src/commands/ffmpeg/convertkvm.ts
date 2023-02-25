import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import trim from "../../lib/ffmpeg/trim";
import convertkvm from "../../lib/ffmpeg/convertkvm";

module.exports = {
    id: "convertkvm",
    name: "Convert KVM",
    desc: "Converts a video into a KVM (Konalt Video Monochrome)",
    needs: ["video"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        convertkvm(buffers).then(
            handleFFmpeg(getFileName("Effect_KVMConv", "kvm"), msg.channel),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
