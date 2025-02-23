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
    let duration = 0.05;
    let type = getTypeSingular(lookup(fixed[1]) || "text/plain");
    if (type != "image") {
        duration = await getVideoLength(fixed);
    }
    let caption = await createCaption2(width, height, options.text);
    return ffmpegBuffer(
        `-i $BUF0 -t ${duration} -loop 1 -i $BUF1 -filter_complex "[1:v][0:v]vstack[captioned];[captioned]scale=trunc(iw/2)*2:trunc(ih/2)*2[scaled];${autoGifPalette(
            "scaled",
            "out",
            fixed[1]
        )};" -map "0:a?" -map "[out]" -update 1 $PRESET $OUT`,
        [fixed, [caption, "png"]]
    );
}
