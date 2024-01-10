import { ffmpegBuffer } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";

export default async function imageaudio(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dur = await getVideoLength(buffers[1]);
    return ffmpegBuffer(
        `-loop 1 -i $BUF0 -i $BUF1 -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p $PRESET -t ${dur} $OUT`,
        buffers,
        "mp4"
    );
}
