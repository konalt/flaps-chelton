import parseScalingTable from "./parseScalingTable";
import { readFile } from "fs/promises";
import {
    getVideoDimensions,
    getFrameCount,
    getVideoLength,
} from "./getVideoDimensions";
import { ffmpegBuffer, file, preset } from "./ffmpeg";
import handleFFmpeg from "./handleFFmpeg";
import { getFileName } from "../utils";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        let dims = await getVideoDimensions(file("horror.mp4"));
        let len = await getVideoLength(file("horror.mp4"));
        parseScalingTable(
            (await readFile(file("scalingtables/thehorror.stb"))).toString(),
            dims[0],
            dims[1],
            len,
            buffers[0]
        ).then((scaleResult) => {
            ffmpegBuffer(
                `-i ${file(
                    "horror.mp4"
                )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v][ckout2]overlay[vout]" -t ${len} -map "[vout]" -map "0:a:0" -preset ${preset} $OUT`,
                [[scaleResult, "NUL.mp4"]],
                "mp4"
            ).then(
                (out) => {
                    res(out);
                },
                (err) => {
                    rej(err);
                }
            );
        });
    });
}
