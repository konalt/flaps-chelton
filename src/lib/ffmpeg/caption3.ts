import { ffmpegBuffer, autoGifPalette } from "./ffmpeg";
import { getVideoDimensions, getVideoLength } from "./getVideoDimensions";
import createCaption2 from "../canvas/createCaption2";
import { Caption2Options } from "../../types";

export default async function caption3(
    buffers: [Buffer, string][],
    options: Caption2Options
): Promise<Buffer> {
    let [width, height] = await getVideoDimensions(buffers[0]);
    let duration = await getVideoLength(buffers[0]);
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
            buffers[0][1]
        )}" -map "0:a?" -map "[out]" -t ${duration} $PRESET $OUT`,
        [buffers[0], [caption, "png"]]
    );
}
