import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";
import createCaption2 from "../canvas/createCaption2";
import { Caption2Options } from "../../types";

export default async function caption3(
    buffers: [Buffer, string][],
    options: Caption2Options
): Promise<Buffer> {
    let [width, height] = await getVideoDimensions(buffers[0]);
    let [caption, boxHeight] = await createCaption2(
        width,
        height,
        options.text
    );
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[1:v]pad=w=iw:h=ih+${height}[padded];[padded][0:v]overlay=x=0:y=${boxHeight}[overlay]" -map "[overlay]" $PRESET $OUT`,
        [buffers[0], [caption, "png"]]
    );
}
