import { ffmpegBuffer } from "./ffmpeg";

export default function gifmp4(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i $BUF0 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -shortest $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
