import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function imgfade(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dur = await getVideoLength(buffers[0]);
    let dims = await getVideoDimensions(buffers[0]);
    return ffmpegBuffer(
        `-i $BUF0 -loop 1 -t ${dur} -i $BUF1 -filter_complex "[1:v]scale=${dims.join(
            ":"
        )},setsar=1:1,fade=t=in:d=${dur}:alpha=1[s1];[0:v][s1]overlay[out]" -t ${dur} -map "[out]" -map "0:a:0" $PRESET $OUT`,
        buffers
    );
}
