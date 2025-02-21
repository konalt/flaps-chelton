import { ffmpegBuffer } from "./ffmpeg";

export default async function fisheye(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let count = 10;
    let filter = `lenscorrection=k1=0.1:k2=0.2:i=bilinear,`.repeat(count);
    let borderSizeOn2048 = 360; // i am not adding cropdetect.
    let imageSizeOn2048 = 2048 - 360 * 2;
    return ffmpegBuffer(
        `-i $BUF0 -vf scale=2048/${borderSizeOn2048}*iw:2048/${borderSizeOn2048}*ih,${filter}crop=${imageSizeOn2048}/2048*iw:${imageSizeOn2048}/2048*ih:${borderSizeOn2048}/2048*iw:${borderSizeOn2048}/2048*ih $PRESET $OUT`,
        buffers
    );
}
