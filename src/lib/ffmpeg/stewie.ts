import parseScalingTable from "./parseScalingTable";
import { readFile } from "fs/promises";
import { getVideoDimensions, getFrameCount } from "./getVideoDimensions";
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        let dims = await getVideoDimensions(file("stewie.mp4"));
        parseScalingTable(
            (await readFile("./images/scalingtables/stewie.stb")).toString(),
            "1:v",
            await getFrameCount(file("stewie.mp4")),
            dims[0],
            dims[1],
            buffers[0]
        ).then(() => {
            let path = file(
                buffers[0][1] + ".%03d." + buffers[0][1].split(".").pop()
            );
            ffmpegBuffer(
                `-i ${file(
                    "stewie.mp4"
                )} -framerate 30 -i ${path} -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v][ckout2]overlay[oout]" -shortest -map "[oout]" -map "0:a:0" -preset ultrafast $OUT`,
                [],
                "mp4"
            ).then((out) => {
                res(out);
            });
        });
    });
}
