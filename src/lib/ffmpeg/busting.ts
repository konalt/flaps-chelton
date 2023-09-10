// ffmpeg -y -i ben.mp4 -ss 5 -t 5.4 -i 40.mp4 -filter_complex "[1:v]scale=-1:720*0.95,setsar=1:1[sc];[0:v][sc]overlay=760:720*0.025:repeatlast=0[ov];[ov]select=gte(n\,2)[out];[0:a][1:a]amix[outa]" -map "[out]" -map "[outa]"
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function busting(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i ${file(
            "ben.mp4"
        )} -t 5.4 -i $BUF0 -filter_complex "[1:v]scale=-1:720*0.95,setsar=1:1[sc];[0:v][sc]overlay=760:720*0.025:repeatlast=0[ov];[ov]select=gte(n\\,2)[out];[0:a][1:a]amix[outa]"  -map "[out]" -map "[outa]" $PRESET $OUT`,
        buffers
    );
}
