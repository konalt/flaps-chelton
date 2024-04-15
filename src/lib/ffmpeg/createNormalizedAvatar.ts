import { ffmpegBuffer } from "./ffmpeg";

export default function createNormalizedAvatar(buffers: Buffer) {
    return ffmpegBuffer(
        "-i $BUF0 -vf scale=128:-2 $OUT",
        [[buffers, "png"]],
        "webp"
    );
}
