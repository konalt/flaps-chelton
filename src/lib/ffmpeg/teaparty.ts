import { ffmpegBuffer, file } from "./ffmpeg";

const w = 512;
const h = w;
const fps = 60;
const duration = 24;

const CenterOverlay = `overlay=x=(W-w)/2:y=(H-h)/2`;

export default async function yababaina(image: Buffer) {
    let img = await ffmpegBuffer(`-i $BUF0 -vf scale=${w}:${h} $OUT`, [
        [image, "png"],
    ]);
    let final = await ffmpegBuffer(
        [
            `-loop 1 -r ${fps} -t ${duration} -i $BUF0`,
            `-i ${file("teaparty.mp3")}`,
            `-filter_complex "[0:v]scale=${w}:${h},split=2[bg][triobig];`,
            // Background
            `[bg]split=2[bg_base][bg_flipped];`,
            `[bg_flipped]hflip[bg_flipped];`,
            `[bg_base][bg_flipped]overlay=0:0:enable='gt(mod(n\\,45)\\,22)'[bg];`,
            // Big Trio
            `[triobig]split=3[tb1][tb2][tb3];`,
            `[tb1]scale=iw*1.25:ih*1.25[tb1];`,
            `[tb2]hflip,scale=iw*1.5:ih*1.5[tb2];`,
            `[tb3]hflip,vflip,scale=iw*1.75:ih*1.75[tb3];`,
            `[tb1][tb2]${CenterOverlay}:enable='gt(n\\,22)'[tb];`,
            `[tb][tb3]${CenterOverlay}:enable='gt(n\\,45)'[tb];`,
            `[tb]split=2[tb1][tb2];`,
            `[tb1]setpts=PTS-STARTPTS+10.5/TB[tb1];`,
            `[tb2]setpts=PTS-STARTPTS+22.5/TB[tb2];`,
            `[bg][tb1]${CenterOverlay}:enable='between(n\\,630\\,720)'[bg];`,
            `[bg][tb2]${CenterOverlay}:enable='between(n\\,1350\\,1440)'[bg];`,
            // Output
            `[1:a]anull[out_audio];[bg]null[out_final]"`,
            `-map "[out_audio]" -map "[out_final]" -r ${fps} -t ${duration} $PRESET $OUT`,
        ].join(" "),
        [[img, "png"]],
        "mp4"
    );
    return final;
}
