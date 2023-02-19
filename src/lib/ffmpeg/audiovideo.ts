import { ffmpegBuffer, preset } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dur = await getVideoLength(buffers[0][1]);
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -map 0:a:0 -map 1:v:0 -c:v copy -c:a aac -preset:v ${preset} -shortest $OUT`,
        buffers,
        "mp4"
    );
}
