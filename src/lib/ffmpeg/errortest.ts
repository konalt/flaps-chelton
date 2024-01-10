import { ffmpegBuffer } from "./ffmpeg";

export default async function errortest(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -filter_complex sdfjisdjidsg -vf sdfjsfjd -c:v dfksdfkj $OUT`,
        buffers
    );
}
