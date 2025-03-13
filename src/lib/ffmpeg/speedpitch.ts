import { SpeedOptions } from "../../types";
import { ffmpegBuffer } from "./ffmpeg";

export default async function speedpitch(
    buffers: [Buffer, string][],
    options: SpeedOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf "setpts=${
            1 / options.speed
        }*PTS" -af "aresample=44100,asetrate=44100*${
            options.speed
        },aresample=44100" $PRESET $OUT`,
        buffers
    );
}
