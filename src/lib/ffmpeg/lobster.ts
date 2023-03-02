import { ffmpegBuffer, preset } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-loop 1 -t 5 -i $BUF0 -filter_complex "[0:v]scale=512:512,setsar=1:1[scaled];[scaled]split=2[to_speen][to_rainbow];[to_speen]rotate=t*180*(PI/180)[speen];[to_rainbow]hue=h=t*180[rainbow];[speen][rainbow]concat=n=2:v=1:a=0[out_v]" -map "[out_v]" -preset:v ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
