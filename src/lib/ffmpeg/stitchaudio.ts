import { ffmpegBuffer } from "./ffmpeg";

export default async function stitchaudio(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[outa]" -map "[outa]" $OUT`,
        buffers
    );
}
