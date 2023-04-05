import { ffmpegBuffer } from "./ffmpeg";

export default async function compress(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf "scale=iw/5:ih/5,scale=iw*5:ih*5,setsar=1:1" -q:v 31 $OUT`,
        buffers,
        "jpeg"
    );
}
