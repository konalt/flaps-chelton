import { ffmpegBuffer } from "./ffmpeg";

export default function invert(buffers: [Buffer, string][]) {
    return ffmpegBuffer("-i $BUF0 -vf negate $PRESET $OUT", buffers);
}
