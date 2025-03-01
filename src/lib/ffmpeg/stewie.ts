import { readFile } from "fs/promises";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import { ffmpegBuffer, file } from "./ffmpeg";
import parsePerspectiveTable from "./parsePerspectiveTable";

export default async function stewie(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        let vid = await readFile(file("stewie.mp4"));
        let dims = await getVideoDimensions([vid, "mp4"]);
        let len = await getVideoLength([vid, "mp4"]);
        parsePerspectiveTable(
            (await readFile(file("data/perspective/stewie.dat"))).toString(),
            dims[0],
            dims[1],
            len,
            30,
            buffers[0]
        ).then((scaleResult) => {
            ffmpegBuffer(
                `-i ${file(
                    "stewie.mp4"
                )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v][ckout2]overlay[oout];[oout]setpts=PTS/1.25[vout];[0:a]atempo=1.25[aout]" -t ${
                    len / 1.25
                } -map "[vout]" -map "[aout]" $PRESET $OUT`,
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
