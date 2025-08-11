import { ffmpegBuffer, file } from "./ffmpeg";

const w = 512;
const h = w;
const fps = 60;
const duration = 24;

export default async function yababaina(image: Buffer) {
    let img = await ffmpegBuffer(`-i $BUF0 -vf scale=${w}:${h} $OUT`, [
        [image, "png"],
    ]);
    let final = await ffmpegBuffer(
        [
            `-loop 1 -r ${fps} -i $BUF0`,
            `-i ${file("teaparty.mp3")}`,
            `-filter_complex "[0:v]split=2[bg_base][bg_flipped];[bg_flipped]hflip[bg_flipped];[bg_base][bg_flipped]overlay=0:0:enable='gt(mod(n\\,45)\\,22)'[bg];`,
            `color=c=0xffffffff:s=${w}x${h}:r=${fps}:d=${duration}[white];color=c=0xffffff00:s=${w}x${h}:r=${fps}:d=${duration}[white_transparent];`,
            `[1:a]anull[out_audio];[bg]null[out_final]"`,
            `-map "[out_audio]" -map "[out_final]" -r ${fps} -t ${duration} $PRESET $OUT`,
        ].join(" "),
        [[img, "png"]],
        "mp4"
    );
    return final;
}
