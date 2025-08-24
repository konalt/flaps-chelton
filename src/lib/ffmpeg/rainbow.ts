import { SCALE_EVEN, ffmpegBuffer, file, gifPalette } from "./ffmpeg";

export default async function rainbow(
    buffers: [Buffer, string][],
    duration: number
) {
    return ffmpegBuffer(
        [
            `-loop 1 -t ${duration} -r 30 -i $BUF0`,
            `-filter_complex "`,
            `[0:v]${SCALE_EVEN},hue=h=(t/${duration})*360[shift];`,
            gifPalette("shift", "out"),
            `" -map "[out]" -t ${duration} $PRESET $OUT`,
        ].join(" "),
        buffers,
        "gif"
    );
}
