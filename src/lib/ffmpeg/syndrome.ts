import { readFile } from "fs/promises";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import { ffmpegBuffer, file } from "./ffmpeg";
import parsePerspectiveTable from "./parsePerspectiveTable";

export default async function syndrome(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        let vid = await readFile(file("syndrome.mp4"));
        let dims = await getVideoDimensions([vid, "mp4"]);
        let len = await getVideoLength([vid, "mp4"]);
        parsePerspectiveTable(
            (await readFile(file("data/perspective/syndrome.dat"))).toString(),
            dims[0],
            dims[1],
            len,
            24,
            buffers[0]
        ).then((scaleResult) => {
            ffmpegBuffer(
                `-i ${file(
                    "syndrome.mp4"
                )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.3[ckout2];[1:v][ckout2]overlay[oout];" -t ${len} -map "[oout]" -map "0:a" $PRESET $OUT`,
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
