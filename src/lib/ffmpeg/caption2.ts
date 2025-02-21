import { ffmpegBuffer, autoGifPalette } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import createCaption2 from "../canvas/createCaption2";
import minimum from "./minimum";
import { Caption2Options } from "../../types";
import { getTypeSingular } from "../utils";
import { lookup } from "mime-types";

export default async function caption2(
    buffers: [Buffer, string][],
    options: Caption2Options
): Promise<Buffer> {
    let fixed: [Buffer, string] = [await minimum([buffers[0]]), buffers[0][1]];
    let [width, height] = await getVideoDimensions(fixed);
    let duration = 0.06;
    if (getTypeSingular(lookup(fixed[1]) || "text/plain") != "image") {
        duration = await getVideoLength(fixed);
    }
    let caption = await createCaption2(width, height, options.text);
    return ffmpegBuffer(
        `-i $BUF0 -loop 1 -i $BUF1 -filter_complex "[1:v][0:v]vstack[captioned];${autoGifPalette(
            "captioned",
            "out",
            fixed[1]
        )}" -map "0:a?" -map "[out]" -ss 0.05 -to ${duration} $PRESET $OUT`,
        [fixed, [caption, "png"]]
    );
}
