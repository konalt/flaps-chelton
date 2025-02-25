import { ffmpegBuffer } from "./ffmpeg";

export default function invert(buffer: [Buffer, string], amount = 180) {
    return ffmpegBuffer(`-i $BUF0 -vf hue=${amount} $PRESET $OUT`, [buffer]);
}
