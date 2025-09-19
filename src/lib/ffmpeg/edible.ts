import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function edible(buffers: [Buffer, string][]) {
    let dims = await getVideoDimensions(buffers[0], true);
    return ffmpegBuffer(
        `-loop 1 -t 4 -i $BUF0 -loop 1 -t 4 -i $BUF1 -i ${file(
            "edible.mp3"
        )} -filter_complex "[0:v]scale=${dims.join(
            ":"
        )}[v0];[1:v]scale=${dims.join(
            ":"
        )}[v1];[v0][v1]xfade=transition=distance:offset=1.6:duration=0.3[out];[2:a]anull[out_a]" -map "[out]" -map "[out_a]" -t 4 $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
