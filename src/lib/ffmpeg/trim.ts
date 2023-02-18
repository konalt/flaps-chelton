import { TrimOptions } from "../../types";
import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][],
    options: TrimOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -ss ${options.start} -to ${options.end} -preset:v ${preset} $OUT`,
        buffers
    );
}
