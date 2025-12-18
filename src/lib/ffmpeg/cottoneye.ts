import { calculateAspectRatioFit } from "../utils";
import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function cottoneye(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    const dims = await getVideoDimensions(buffers[0], true);
    const dims2 = calculateAspectRatioFit(...dims, Infinity, 430);
    return ffmpegBuffer(
        `-i $BUF0 -i ${file(
            "cottoneye.mp4"
        )} -filter_complex "[0:v]scale=${dims2.join(
            ":"
        )}[i];[1:v][i]overlay=552-w/2:292[out];[1:a]anull[a]" -map "[out]" -map "[a]" $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
