import { ffmpegBuffer, file } from "./ffmpeg";
import { getFrameCount, getVideoLength } from "./getVideoDimensions";

export default async function lameimpala(): Promise<Buffer> {
    let frames = await getVideoLength(file("images/animals.mp4"));
    return ffmpegBuffer(
        `-i ${file("images/animals.mp4")} -ss ${
            Math.random() * frames
        } -frames:v 1 -update 1 $OUT`,
        [],
        "png"
    );
}
