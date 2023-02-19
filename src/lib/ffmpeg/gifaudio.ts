import { ffmpegBuffer, preset } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";

export default async function gifaudio(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dur = Math.min(
        await getVideoLength(buffers[1][1]),
        await getVideoLength(buffers[0][1])
    );
    return ffmpegBuffer(
        `-ignore_loop 1 -i $BUF0 -i $BUF1 -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -preset:v ${preset} -t ${dur} $OUT`,
        buffers,
        "mp4"
    );
}
