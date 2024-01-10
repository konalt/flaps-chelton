import { ffmpegBuffer } from "./ffmpeg";

export default function minimum(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        "-i $BUF0 -vf scale=-2:h=max(ih\\,368) $PRESET $OUT",
        buffers
    );
}
