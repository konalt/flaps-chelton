import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";

export default async function busting(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let vl = Math.min(await getVideoLength(buffers[0]), 5.325);
    let duroffset = 5.325 - vl;
    return ffmpegBuffer(
        `-ss ${duroffset} -i ${file(
            "ben.mp4"
        )} -t 5.325 -i $BUF0 -filter_complex "[1:v]scale=720*0.95:720*0.95,setsar=1:1[sc];[0:v][sc]overlay=850-(720*0.95)/2:720*0.025:enable='between(t\\,0,${vl})':eval=frame[ov];[ov]select=gte(n\\,2)[out];[0:a][1:a]amix[outa]" -t 14.9 -map "[out]" -map "[outa]" $PRESET $OUT`,
        buffers
    );
}
