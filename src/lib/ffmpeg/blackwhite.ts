import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function blackwhite(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf monochrome -preset:v ${preset} $OUT`,
        buffers
    );
}
