import { ffmpegBuffer, preset } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function stitch(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0][1]);
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[1:v]scale=${dims.join(
            ":"
        )},setsar=1:1[s1];[0:v][s1]concat=n=2:v=1:a=0[outv];[0:a][1:a]concat=n=2:v=0:a=1[outa]" -map "[outv]" -map "[outa]" -preset:v ${preset} $OUT`,
        buffers
    );
}
