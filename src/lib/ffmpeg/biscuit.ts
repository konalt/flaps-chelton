import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";
import { readFile } from "fs/promises";

export async function biscuit(buffers: [Buffer, string][]) {
    var len = await getVideoLength([
        await readFile(file("biscuit.mp4")),
        "mp4",
    ]);
    var start_time = 3.65;
    var length = 0.49;

    return ffmpegBuffer(
        `-loop 1 -t ${len} -i $BUF0 -i ${file(
            "biscuit.mp4"
        )} -filter_complex "[0:v]scale=240:240,setsar=1:1,fade=out:st=${start_time}:d=${length}[fader];[1:v][fader]overlay=enable='between(t,${start_time},${
            start_time + length
        })'[final]" -shortest -map "[final]" -map "1:a:0" $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
