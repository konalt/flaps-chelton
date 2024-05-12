import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function imgfade(
    buffers: [Buffer, string][],
    dur: number
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0], true);
    return ffmpegBuffer(
        `-loop 1 -t ${dur} -i $BUF0 -loop 1 -t ${dur} -i $BUF1 -filter_complex "[0:v]scale=${dims.join(
            ":"
        )},setsar=1:1[0vf];[1:v]scale=${dims.join(
            ":"
        )},setsar=1:1,fade=t=in:d=${dur}:alpha=1[s1];[0vf][s1]overlay[out]" -t ${dur} -map "[out]" -an $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
