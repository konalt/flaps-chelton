import { Caption2Options } from "../../types";
import { ffmpegBuffer, file, preset } from "./ffmpeg";

export default async function invert(
    buffers: [Buffer, string][],
    options: Caption2Options
): Promise<Buffer> {
    // datamosh
    // -bsf:v noise=drop='not(key)*round(random(0))'
    //
    var fixChar = (c: string) =>
        c
            .replace(/\\/g, "\\\\\\\\")
            .replace(/'/g, "\u2019")
            .replace(/"/g, '\\\\\\"')
            .replace(/%/g, "\\\\\\%")
            .replace(/:/g, "\\\\\\:")
            .replace(/\n/g, "\\\\\\n");
    return ffmpegBuffer(
        `-loop 1 -t 5 -i $BUF0 -f lavfi -t 3 -i color=s=512x512:c=0x3641b1 -i ${file(
            "images/sudno.mp3"
        )} -filter_complex "color=s=512x512:c=red@0.0:d=3:r=25,format=rgba[transparent];[transparent]split=1[tr_dt];[tr_dt]drawtext=text='${fixChar(
            options.text
        )}':fontcolor=white:fontsize=min(t*2*64\\,64):fontfile=fonts/font.ttf:x=(w-text_w)/2:y=(h-text_h)/2,rotate=a=min(2*180\\,t*3*180)*(PI/180):c=none,format=rgba[text_overlay];[1:v][text_overlay]overlay[text];[0:v]scale=512:-1,pad=512:512:0:256-ih/2:black,setsar=1:1[scaled];[scaled]split=2[to_speen][to_rainbow];[to_speen]rotate=t*0.5*180*(PI/180)*-1[speen];[to_rainbow]hue=h=t*180,trim=0:3[rainbow];[speen][rainbow]xfade=transition=dissolve:duration=1:offset=4,format=yuv420p[transitioned_a];[text][transitioned_a]xfade=transition=circleopen:duration=1:offset=2,format=yuv420p[out_nocrop];[out_nocrop]crop=480:480:0:0[out_v]" -map "[out_v]" -map "2:a:0" -t 9 -crf:v 51 -b:v 16k -preset:v ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
