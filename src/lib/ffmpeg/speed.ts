import { SpeedOptions } from "../../types";
import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function trim(
    buffers: [Buffer, string][],
    options: SpeedOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf "setpts=${1 / options.speed}*PTS" -af "atempo=${
            options.speed
        }" -preset:v ${preset} $OUT`,
        buffers
    );
}
