import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function stack(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dims1 = await getVideoDimensions(buffers[0]);
    let dims2 = await getVideoDimensions(buffers[1]);
    let scaledDim2H = dims1[1] * (dims2[1] / dims2[0]);
    let totalHeight = dims1[1] + scaledDim2H;
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v]pad=${dims1[0]}:${totalHeight}:0:0[pad];[1:v]scale=${dims1[0]}:${scaledDim2H}[scale];[pad][scale]overlay=x=0:y=${dims1[1]}[out]" -map "[out]" $PRESET $OUT`,
        buffers
    );
}
