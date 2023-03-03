import { ffmpegBuffer, file, preset } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function holymoly(buffers: [Buffer, string][]) {
    var dims = await getVideoDimensions(file("holymoly.mp4"));
    var fullFilter = [
        "[0:v]colorkey=0x00FF00:0.2:0.2[ckout]",
        "[1:v]scale=" +
            dims[0] * 0.45 +
            ":" +
            dims[1] / 2 +
            ",pad=" +
            dims.join(":") +
            ":" +
            dims[0] / 6 +
            ":0[img]",
        "[img][ckout]overlay[oout]",
    ].join(";");
    return ffmpegBuffer(
        `-i ${file(
            "holymoly.mp4"
        )} -i $BUF0 -filter_complex "${fullFilter}" -shortest -map "[oout]" -map "0:a:0" -preset:v ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
