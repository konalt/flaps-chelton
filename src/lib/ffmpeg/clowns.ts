import { readFile } from "fs/promises";
import { ffmpegBuffer, file } from "./ffmpeg";
import parsePerspectiveTable from "./parsePerspectiveTable";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import videoGif from "./videogif";

export default async function clowns(buffers: [Buffer, string][]) {
    let vid = await readFile(file("clowns.mp4"));
    let dims = await getVideoDimensions([vid, "mp4"]);
    let len = await getVideoLength([vid, "mp4"]);
    let perspective = await parsePerspectiveTable(
        (await readFile(file("data/perspective/clowns_motion.dat"))).toString(),
        dims[0],
        dims[1],
        len,
        25,
        buffers[0],
        true,
        false,
        [-1, -1],
        1,
        1
    );
    return ffmpegBuffer(
        `-i ${file(
            "clowns.mp4"
        )} -i $BUF0 -filter_complex "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2];[1:v]setpts=PTS+0.06/TB[image];[image][ckout2]overlay[vout];[0:a]anull[aout]" -map "[vout]" -map "[aout]" -t ${len} $PRESET $OUT`,
        [[perspective, "mp4"]],
        "mp4"
    );
}
