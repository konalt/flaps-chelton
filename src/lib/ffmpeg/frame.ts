import createFrame from "../canvas/createFrame";
import { ffmpegBuffer } from "./ffmpeg";

export default async function frame(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let [frame, padSize] = await createFrame(buffers[0][0]);
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v]scale=512:-1,pad=w=iw+${
            padSize * 2
        }:h=ih+${
            padSize * 2
        }:x=${padSize}:y=${padSize}[pad];[pad][1:v]overlay[out]" -map "[out]" -update 1 -frames:v 1 $OUT`,
        [buffers[0], [frame, "png"]]
    );
}
