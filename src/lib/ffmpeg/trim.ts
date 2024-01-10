import { TrimOptions } from "../../types";
import { ffmpegBuffer } from "./ffmpeg";

export default async function trim(
    buffers: [Buffer, string][],
    options: TrimOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -ss ${options.start} -to ${options.end} $PRESET $OUT`,
        buffers
    );
}
