import { ffmpegBuffer } from "./ffmpeg";

export default async function compressJPGExtreme(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf "scale=iw/10:ih/10,scale=iw*10:ih*10,setsar=1:1" -q:v 40 $OUT`,
        buffers,
        "jpeg"
    );
}
