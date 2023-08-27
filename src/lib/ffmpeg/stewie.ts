import parseScalingTable from "./parseScalingTable";
import { readFile } from "fs/promises";
import {
    getVideoDimensions,
    getFrameCount,
    getVideoLength,
} from "./getVideoDimensions";
import { ffmpegBuffer, file, preset } from "./ffmpeg";

export default async function stewie(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        let dims = await getVideoDimensions(file("stewie.mp4"));
        let len = await getVideoLength(file("stewie.mp4"));
        parseScalingTable(
            (await readFile(file("scalingtables/thehorror.stb"))).toString(),
            dims[0],
            dims[1],
            len,
            buffers[0]
        ).then((scaleResult) => {
            ffmpegBuffer(
                `-i ${file(
                    "stewie.mp4"
                )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v][ckout2]overlay[oout];[oout]setpts=PTS/1.25[vout];[0:a]atempo=1.25[aout]" -t ${
                    len / 1.25
                } -map "[vout]" -map "[aout]" -preset ${preset} $OUT`,
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
