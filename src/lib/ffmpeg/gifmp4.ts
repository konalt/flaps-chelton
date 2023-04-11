import { ffmpegBuffer } from "./ffmpeg";

export default function gifmp4(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i $BUF0 -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" $OUT`,
        buffers,
        "mp4"
    );
}
