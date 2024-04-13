import { ffmpegBuffer } from "./ffmpeg";

export default async function webpToPNG(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(`-i $BUF0 $OUT`, buffers, "png");
}
