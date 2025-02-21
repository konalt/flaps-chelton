import { ffmpegBuffer } from "./ffmpeg";

export default async function fisheye(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let count = 10;
    let filter = `lenscorrection=k1=0.1:k2=0.2:i=bilinear,`.repeat(count);
    let borderSizeOn2048 = 360; // i am not adding cropdetect.
    let imageSizeOn2048 = 2048 - borderSizeOn2048 * 2;
    let scale = 2048 / borderSizeOn2048;
    let imageSize = imageSizeOn2048 / 2048;
    let borderSize = borderSizeOn2048 / 2048;
    return ffmpegBuffer(
        `-i $BUF0 -vf scale=${scale}*iw:${scale}*ih,${filter}crop=${imageSize}*iw:${imageSize}*ih:${borderSize}*iw:${borderSize}*ih $PRESET $OUT`,
        buffers
    );
}
