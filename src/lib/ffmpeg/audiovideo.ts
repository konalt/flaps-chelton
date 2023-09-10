import { ffmpegBuffer } from "./ffmpeg";

export default async function audiovideo(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -map 0:a:0 -map 1:v:0 -c:v copy -c:a aac $PRESET -shortest $OUT`,
        buffers,
        "mp4"
    );
}
