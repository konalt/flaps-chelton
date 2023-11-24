import { ffmpegBuffer, autoGifPalette } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import createCaption2 from "../canvas/createCaption2";
import minimum from "./minimum";
import { Caption2Options } from "../../types";

export default async function caption2(
    buffers: [Buffer, string][],
    options: Caption2Options
): Promise<Buffer> {
    let fixed: [Buffer, string] = [await minimum([buffers[0]]), buffers[0][1]];
    let [width, height] = await getVideoDimensions(fixed);
    let duration = await getVideoLength(fixed);
    if (Number.isNaN(duration)) {
        duration = 0.05; // fucking images
    }
    let [caption, boxHeight] = await createCaption2(
        width,
        height,
        options.text
    );
    return ffmpegBuffer(
        `-i $BUF0 -loop 1 -t ${duration} -i $BUF1 -filter_complex "[1:v]pad=ceil(iw/2)*2:ceil(ih/2)*2[even];[even]pad=w=iw:h=ih+${height}[padded];[padded][0:v]overlay=x=0:y=${boxHeight}[overlay];${autoGifPalette(
            "overlay",
            "out",
            fixed[1]
        )}" -map "0:a?" -map "[out]" -t ${duration} $PRESET $OUT`,
        [fixed, [caption, "png"]]
    );
}
