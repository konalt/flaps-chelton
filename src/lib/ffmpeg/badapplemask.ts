import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";

export default async function invert(buffers: [Buffer, string][]) {
    let durs = await Promise.all([
        getVideoLength(buffers[0]),
        getVideoLength(buffers[1]),
    ]);
    let badappledur = 180 + 39;
    let mindur = Math.min(...durs, badappledur);
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -ss 1 -i ${file(
            "badapple.mp4"
        )} -filter_complex "[0:v]scale=640:480,setsar=1:1[0s];[1:v]scale=640:480,setsar=1:1[1s];[2:v]scale=640:480,setsar=1:1[badapples];[0s][badapples]alphamerge[0sb];[1s][0sb]overlay[outv];[0:a][1:a]amix[01a];[2:a]volume=0.5[baa];[01a][baa]amix[outa]" -map "[outv]" -map "[outa]" -t ${mindur} $PRESET $OUT`,
        buffers
    );
}
