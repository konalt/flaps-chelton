import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function stitchgif(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0]);
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[1:v]scale=${dims.join(
            ":"
        )},setsar=1:1[s1];[0:v][s1]concat=n=2:v=1:a=0[outv]" -map "[outv]" $PRESET $OUT`,
        buffers
    );
}
