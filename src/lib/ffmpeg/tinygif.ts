import { ffmpegBuffer, gifPalette } from "./ffmpeg";

export default function tinygif(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i $BUF0 -filter_complex "[0:v]scale=64:-2,fps=8[comp];${gifPalette(
            "comp",
            "out"
        )}" -map "[out]" $OUT`,
        buffers
    );
}
