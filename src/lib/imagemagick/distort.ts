import compressImage from "../ffmpeg/compressimage";
import { ffmpegBuffer } from "../ffmpeg/ffmpeg";
import { getVideoDimensions } from "../ffmpeg/getVideoDimensions";
import { imagemagickBuffer } from "./imagemagick";

export default async function distort(buffer: Buffer, factor = 0.5) {
    let scaled = await compressImage([buffer, "png"], 1000);
    let dims = await getVideoDimensions([scaled, "png"]);
    return imagemagickBuffer(
        `-liquid-rescale ${dims
            .map((r) => Math.min(r * factor, 2000))
            .join("x")} -implode 0.25 -resize ${dims.join("x")}`,
        scaled
    );
}
