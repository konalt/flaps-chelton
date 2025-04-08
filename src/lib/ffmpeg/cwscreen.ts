import { readFile } from "fs/promises";
import { ffmpegBuffer, file } from "./ffmpeg";
import parsePerspectiveTable from "./parsePerspectiveTable";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function cwScreen(buffers: [Buffer, string][]) {
    let vid = await readFile(file("cwscreen.mp4"));
    let dims = await getVideoDimensions([vid, "mp4"]);
    let len = await getVideoLength([vid, "mp4"]);
    let perspective = await parsePerspectiveTable(
        (await readFile(file("data/perspective/cwscreen.dat"))).toString(),
        dims[0],
        dims[1],
        len,
        60,
        buffers[0],
        true,
        true,
        [720, 720]
    );
    return ffmpegBuffer(
        `-i ${file(
            "cwscreen.mp4"
        )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v][ckout2]overlay[vout];[0:a]anull[aout]" -map "[vout]" -map "[aout]" -shortest $PRESET $OUT`,
        [[perspective, "mp4"]],
        "mp4"
    );
}
