import { readFile } from "fs/promises";
import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function pancake(buffers: [Buffer, string][]) {
    const perpectiveData = (await readFile(file("data/pancake.dat"), "utf8"))
        .split("\n")
        .map((l) => l.split(" "));
    return ffmpegBuffer(
        `-i ${file("pancake/black.png")} -i ${file(
            "pancake/white.png"
        )} -i $BUF0 -filter_complex "[2:v]monochrome,normalize,scale=1393-2:813-2,gblur=sigma=5,pad=iw+2:ih+2:1:1:black,perspective=${perpectiveData[0].join(
            ":"
        )}:sense=1[mask];[1:v][mask]alphamerge[whitemasked];[0:v][whitemasked]overlay=0:0[ov]" -map "[ov]" $OUT`,
        buffers
    );
}
