import { ffmpegBuffer, preset, usePreset } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";

export default async function perseverantia(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dur = await getVideoLength(buffers[0][1]);
    return ffmpegBuffer(
        `-i $BUF0 -filter_complex "[0:v]reverse[rev];[0:v][rev]concat=n=2:v=1:a=0[vout];areverse[arev];[arev]asplit=2[arev1][arev2];[arev1]areverse[aunrev];[aunrev][arev2]concat=n=2:v=0:a=1[aout]" -map "[aout]" -map "[vout]" -t ${
            dur * 2
        } ${usePreset(buffers[0][1])} $OUT`,
        buffers
    );
}
