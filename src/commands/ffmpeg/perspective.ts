import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import parsePerspectiveTable from "../../lib/ffmpeg/parsePerspectiveTable";
import { readFile } from "fs/promises";
import { file } from "../../lib/ffmpeg/ffmpeg";

module.exports = {
    id: "perspective",
    name: "Perspective Table Test",
    desc: "Test a perspective table. Syntax: `path vw vh vlen vfps`",
    needs: ["image"],
    aliases: ["persp"],
    async execute(args, buffers) {
        return new Promise(async (res, rej) => {
            parsePerspectiveTable(
                (await readFile(file(args[0]))).toString(),
                parseInt(args[1]),
                parseInt(args[2]),
                parseFloat(args[3]),
                parseInt(args[4]),
                buffers[0],
                args[5] == "y",
                args[6] == "y",
                [parseInt(args[7]), parseInt(args[8])],
                parseFloat(args[9])
            ).then(
                handleFFmpeg(getFileName("Effect_PerspTest", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
