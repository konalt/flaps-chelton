import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function reverse(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf reverse -af areverse -preset:v ${preset} $OUT`,
        buffers
    );
}
