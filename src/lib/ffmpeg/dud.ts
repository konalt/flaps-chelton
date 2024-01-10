import parseScalingTable from "./parseScalingTable";
import { readFile } from "fs/promises";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function dud(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        var vid = await readFile(file("horror.mp4"));
        let dims = await getVideoDimensions([vid, "mp4"]);
        let len = await getVideoLength([vid, "mp4"]);
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
                )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v][ckout2]overlay[vout]" -t ${len} -map "[vout]" -map "0:a:0" $PRESET $OUT`,
                [[scaleResult, "mp4"]],
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
