import { ffmpegBuffer } from "./ffmpeg";

export default function videoGif(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i $BUF0 -vf "fps=16,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 $OUT`,
        buffers,
        "gif"
    );
}
