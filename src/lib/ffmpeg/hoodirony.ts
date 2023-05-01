import { ffmpegBuffer, file, preset } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function pepsi(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    var dims = await getVideoDimensions(buffers[0][1]);

    return ffmpegBuffer(
        `-i $BUF0 -stream_loop 1 -i ${file(
            "images/hood.mp4"
        )} -filter_complex "[1:v]scale=${dims.join(
            ":"
        )},chromakey=0x00ff00:0.1:0.2[hoodwalk];[0:v][hoodwalk]overlay=0:0[out_v]" -map "[out_v]" -map "0:a:0" -shortest -preset:v ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
