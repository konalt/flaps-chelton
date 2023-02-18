import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf monochrome -preset:v ${preset} $OUT`,
        buffers
    );
}
