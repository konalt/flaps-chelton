import { calculateAspectRatioFit } from "../utils";
import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function compressImage(
    buffer: [Buffer, string]
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffer);
    let maxSize = parseInt(process.env.MAX_PERMA_IMAGE_SIZE);
    let fixedDims = [0, 0];
    if (Math.max(dims[0], dims[1]) < maxSize) {
        fixedDims = dims;
    } else {
        fixedDims = calculateAspectRatioFit(dims[0], dims[1], maxSize, maxSize);
    }
    return ffmpegBuffer(
        `-i $BUF0 -vf "scale=${fixedDims[0]}:${fixedDims[1]},setsar=1:1" -q:v 8 $OUT`,
        [buffer],
        "jpeg"
    );
}
