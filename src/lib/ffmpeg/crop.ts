import { CropOptions } from "../../types";
import { ffmpegBuffer } from "./ffmpeg";

export default function crop(
    buffers: [Buffer, string][],
    options: CropOptions
) {
    if (options.mode == "percent") {
        return ffmpegBuffer(
            `-i $BUF0 -vf "crop=${options.width / 100}*iw:${
                options.height / 100
            }*ih:${options.x / 100}*iw:${options.y / 100}*ih" $PRESET $OUT`,
            buffers
        );
    } else {
        return ffmpegBuffer(
            `-i $BUF0 -vf "crop=${options.width}:${options.height}:${options.x}:${options.y}" $PRESET $OUT`,
            buffers
        );
    }
}
