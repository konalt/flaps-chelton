import { SpeedOptions } from "../../types";
import { ffmpegBuffer } from "./ffmpeg";

export default async function speed(
    buffers: [Buffer, string][],
    options: SpeedOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf "setpts=${1 / options.speed}*PTS" -af "atempo=${
            options.speed
        }" $PRESET $OUT`,
        buffers
    );
}
