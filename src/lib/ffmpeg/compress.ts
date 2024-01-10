import { ffmpegBuffer } from "./ffmpeg";

export default async function compress(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf "scale=trunc(iw/10/2)*2:trunc(ih/10/2)*2,framerate=5,scale=trunc(iw*10/2)*2:trunc(ih*10/2)*2" -b:a 5k -ac 1 -ar 16000 -c:a aac -crf:v 51 -b:v 16k $PRESET $OUT`,
        buffers
    );
}
