import { ffmpegBuffer } from "./ffmpeg";

export default async function fisheye(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let count = 10;
    let filter = `lenscorrection=k1=-0.1:k2=-0.2:i=bilinear,`.repeat(count);
    return ffmpegBuffer(`-i $BUF0 -vf ${filter} $PRESET $OUT`, buffers);
}
