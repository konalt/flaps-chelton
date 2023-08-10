import { ffmpegBuffer, preset, usePreset } from "./ffmpeg";

export default async function blackwhite(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf monochrome ${usePreset(buffers[0][1])} $OUT`,
        buffers
    );
}
