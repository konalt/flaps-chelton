import { ffmpegBuffer, gifPalette } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function fade(
    buffers: [Buffer, string][],
    direction: "in" | "out" = "in",
    duration = 1
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0], true);
    let order = direction == "out" ? `[img][1:v]` : `[1:v][img]`;
    return ffmpegBuffer(
        `-loop 1 -i $BUF0 -f lavfi -i color=0x000000:d=${duration}:s=${dims.join(
            "x"
        )}:r=25 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -filter_complex "[0:v]scale=${dims.join(
            ":"
        )}[img];${order}xfade=duration=${
            duration * 0.9
        }:offset=0[out];[2:a]anull[a]" -map "[out]" -map "[a]" -t ${duration} $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
