import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName, getTypeSingular } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { lookup } from "mime-types";
import compressJPG from "../../lib/ffmpeg/compressjpg";

module.exports = {
    id: "compress",
    name: "Compress",
    desc: "Compresses a video/image a comical amount.",
    needs: ["video/image"],
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            let proc = compress;
            if (getTypeSingular(lookup(buf[0][1]) || "unknown") == "image")
                proc = compressJPG;
            proc(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Compress", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
