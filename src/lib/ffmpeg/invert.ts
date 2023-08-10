import { ffmpegBuffer, preset, usePreset } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf negate ${usePreset(buffers[0][1])} $OUT`,
        buffers
    );
}
