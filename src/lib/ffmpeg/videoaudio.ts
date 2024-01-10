import { ffmpegBuffer } from "./ffmpeg";

export default async function videoaudio(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac $PRESET -shortest $OUT`,
        buffers,
        "mp4"
    );
}
