import { SpinOptions } from "../../types";
import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function trim(
    buffers: [Buffer, string][],
    options: SpinOptions
): Promise<Buffer> {
    return ffmpegBuffer(
        `-loop 1 -t ${
            options.length
        } -i $BUF0 -f lavfi -i anullsrc=r=48000:cl=mono -t ${
            options.length
        } -filter_complex "[0:v]scale=trunc(iw/2)*2:trunc(ih/2)*2,rotate=t*${
            options.speed
        }*180*(PI/180)${
            options.gif
                ? ",split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
                : ""
        }[out_v]" -map "[out_v]"${
            options.gif ? "" : ' -map "1:a:0"'
        } -c:v libx264 $PRESET -t ${options.length} $OUT`,
        buffers,
        options.gif ? "gif" : "mp4"
    );
}
