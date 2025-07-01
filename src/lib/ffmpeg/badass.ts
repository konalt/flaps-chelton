import { readFile } from "fs/promises";
import createBadassTextMap from "../canvas/createBadassTextMap";
import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";

export default async function badass(
    buffers: [Buffer, string][],
    text: string
) {
    let dur = await getVideoLength([
        await readFile(file("badass/epicmusic.mp3")),
        "mp3",
    ]);
    let textmask = await createBadassTextMap(text);
    let masked = await ffmpegBuffer(
        `-loop 1 -r 30 -i $BUF0
-loop 1 -r 30 -i $BUF1
-stream_loop 1 -i ${file("badass/bg.mp4")}
-loop 1 -r 30 -i ${file("badass/dragon.png")}
-i ${file("badass/epicmusic.mp3")}
-filter_complex "[2:v]scale=-2:600,setsar=1:1,crop=800:600:iw/2-ow/2:0[bg];
[3:v]scale=800:200[scaled_img];
[scaled_img][1:v]alphamerge[mask];
[bg][mask]overlay=x=0:y=50:eval=frame[out_noeff];
[out_noeff]zoompan=z='zoom+0.0005':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=800x600:fps=30[out_zoom];
[4:a]anull[oa]" -map "[out_zoom]" -map "[oa]" -c:v libx264 -t ${dur} $PRESET $OUT`,
        [buffers[0], [textmask, "png"]],
        "mp4"
    );
    return masked;
}
