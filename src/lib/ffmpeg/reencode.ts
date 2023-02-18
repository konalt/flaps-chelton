import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -c:a aac -c:v libx264 -preset:v ${preset} $OUT`,
        buffers
    );
}
