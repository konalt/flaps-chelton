import { ffmpegBuffer, preset } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[outa]" -map "[outa]" $OUT`,
        buffers
    );
}
