import { autoGifPalette, ffmpegBuffer } from "./ffmpeg";

export default function minimum(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i $BUF0 -filter_complex "[0:v]scale=-2:h=max(ih\\,368)[sc];${autoGifPalette(
            "sc",
            "out",
            buffers[0][1]
        )}" -map "[out]" -map "0:a?" $PRESET $OUT`,
        buffers
    );
}
