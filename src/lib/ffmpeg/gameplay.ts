import { FFmpegPercentUpdate } from "../../types";
import make512x512 from "../canvas/make512x512";
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function gameplay(
    buffers: [Buffer, string][],
    highres: boolean,
    updateFn: (update: FFmpegPercentUpdate) => void = () => {
        void 0;
    }
) {
    let newbuf = await make512x512(buffers[0][0], highres ? 400 : 200);
    return ffmpegBuffer(
        `-loop 1 -r 25 -i $BUF0 -i ${file(
            "gameplay.mp3"
        )} -/filter_complex ./ffscripts/gameplay${
            highres ? "" : "_lowres"
        }.ffscript -sws_flags fast_bilinear -c:v libx264 -tune animation -r 25 -t 29 -map "[out_v]" -map "1:a:0" -c:a copy -preset ultrafast $OUT`,
        [[newbuf, "png"]],
        "mp4",
        true,
        updateFn,
        725,
        true
    );
}
