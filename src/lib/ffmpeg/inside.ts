import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";
import { readFile } from "fs/promises";

export default async function inside(buffers: [Buffer, string][]) {
    var len = await getVideoLength([await readFile(file("inside.mp4")), "mp4"]);
    var start_time = 7.5;
    return ffmpegBuffer(
        `-loop 1 -t ${len} -i $BUF0 -i ${file(
            "inside.mp4"
        )} -filter_complex "[0:v]scale=732:720,setsar=1:1[img];[1:v][img]overlay=enable='between(t,${start_time},${start_time}+0.08)'[final]" -shortest -map "[final]" -map "1:a:0" $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
