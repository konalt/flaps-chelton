import { ffmpegBuffer } from "./ffmpeg";
import { getFrameCount } from "./getVideoDimensions";

export default async function convertToImageSequence(buffer: [Buffer, string]) {
    let frameCount = await getFrameCount(buffer);
    let promises: Buffer[] = [];
    for (let i = 0; i < frameCount; i++) {
        promises.push(
            await ffmpegBuffer(
                `-i $BUF0 -vf "select=eq(n\\,${i})" -vframes 1 $OUT`,
                [buffer],
                "png"
            )
        );
        console.log(i);
    }
    return promises;
}
