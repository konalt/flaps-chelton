import compressImage from "../ffmpeg/compressimage";
import { getVideoDimensions } from "../ffmpeg/getVideoDimensions";
import { imagemagickBuffer } from "./imagemagick";

export default async function distort(
    buffer: Buffer,
    factor = 0.5,
    disableFFmpegStuff = false,
    suppliedDimensions: [number, number] = [0, 0]
) {
    let scaled: Buffer = buffer;
    let dims: [number, number] = suppliedDimensions;
    if (!disableFFmpegStuff) {
        scaled = await compressImage([buffer, "png"], 1000, true);
        dims = await getVideoDimensions([scaled, "png"]);
    }
    return imagemagickBuffer(
        `-liquid-rescale ${dims
            .map((r) => Math.min(r * factor, 2000))
            .join("x")} -resize ${dims.join("x")}`,
        scaled
    );
}
