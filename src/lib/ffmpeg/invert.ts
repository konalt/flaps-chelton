import { ffmpegNewBuffer } from "./ffmpeg";

export default function invert(buffers: [Buffer, string][]) {
    return ffmpegNewBuffer("-i $BUF0 -vf negate $PRESET $OUT", buffers);
}
