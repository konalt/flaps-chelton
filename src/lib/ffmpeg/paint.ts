import { ffmpegBuffer, file } from "./ffmpeg";

export default async function invert(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        [
            `-loop 1 -t 1.5 -r 24 -i $BUF0`,
            buffers.length > 1
                ? `-loop 1 -t 1.5 -r 24 -i $BUF1`
                : "-f lavfi -i color=d=1.5:r=24:s=640x580:c=0xffffffff",
            `-i ${file("paintmask.mp4")} -filter_complex "`,
            `[0:v]scale=640:580,setsar=1:1[0s];`,
            `[1:v]scale=640:580,setsar=1:1[1s];`,
            `[2:v]negate[mask];`,
            `[0s][mask]alphamerge[0sb];`,
            `[1s][0sb]overlay[outv];`,
            `" -map "[outv]" -t 1.5 $PRESET $OUT`,
        ].join(" "),
        buffers,
        "mp4"
    );
}
