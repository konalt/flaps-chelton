import { ffmpegBuffer } from "./ffmpeg";

export default async function reencode(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(`-i $BUF0 -c:a aac -c:v libx264 $PRESET $OUT`, buffers);
}
