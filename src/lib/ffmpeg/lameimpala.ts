import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";
import { readFile } from "fs/promises";

export default async function lameimpala(): Promise<Buffer> {
    let frames = await getVideoLength([
        await readFile(file("images/animals.mp4")),
        "mp4",
    ]);
    return ffmpegBuffer(
        `-i ${file("images/animals.mp4")} -ss ${
            Math.random() * frames
        } -frames:v 1 -update 1 $OUT`,
        [],
        "png"
    );
}
