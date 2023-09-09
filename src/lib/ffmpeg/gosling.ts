import { ffmpegBuffer, file, preset } from "./ffmpeg";

export default async function gosling(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-f lavfi -i color=c=0x313752:s=512x512 -i ${file(
            "gosling.png"
        )} -i $BUF0 -ss 10.7 -i ${file(
            "nightcall.mp3"
        )} -filter_complex "[1:v]scale=-2:512[gos];[2:v]scale=260:-1[img];[0:v][gos]overlay=x=270[gosbg];[gosbg][img]overlay=x=180-overlay_w/2:y=256-overlay_h/2[out]" -map "[out]" -map "3:a:0" -t 10.2 -preset ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
