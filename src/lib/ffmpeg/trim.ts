import { TrimOptions } from "../../types";
import { ffmpegBuffer, preset, usePreset } from "./ffmpeg";

export default async function trim(
    buffers: [Buffer, string][],
    options: TrimOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -ss ${options.start} -to ${options.end} ${usePreset(
            buffers[0][1]
        )} $OUT`,
        buffers
    );
}
