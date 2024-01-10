import { ffmpegBuffer, preset } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function stitch(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0]);
    let len =
        (await getVideoLength(buffers[0])) + (await getVideoLength(buffers[1]));
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v]scale=${dims.join(
            ":"
        )},setsar=1:1[s2];[1:v]scale=${dims.join(
            ":"
        )},setsar=1:1[s1];[s2][s1]concat=n=2:v=1:a=0[outv];[0:a][1:a]concat=n=2:v=0:a=1[outa]" -t ${len} -map "[outv]" -map "[outa]" -fps_mode vfr $PRESET $OUT`,
        buffers
    );
}
