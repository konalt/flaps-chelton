import { ffmpegBuffer } from "./ffmpeg";

export default function invert(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i $BUF0 -filter_complex "[0:v]split=2[base][side];[side]crop=iw/2:ih:0:0,hflip[side_flipped];[base][side_flipped]overlay=x=W/2:y=0[o]" -map "[o]" $PRESET $OUT`,
        buffers
    );
}
