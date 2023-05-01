import { ffmpegBuffer, file, preset } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function pepsi(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    var fixChar = (c: string) =>
        c
            .replace(/\\/g, "\\\\\\\\")
            .replace(/'/g, "\u2019")
            .replace(/"/g, '\\\\\\"')
            .replace(/%/g, "\\\\\\%")
            .replace(/:/g, "\\\\\\:")
            .replace(/\n/g, "\\\\\\n");
    var dims = await getVideoDimensions(buffers[0][1]);
    var w = 0,
        h = 0;
    if (dims[0] > dims[1]) {
        w = 512;
        h = Math.round(512 * (dims[1] / dims[0]));
    } else {
        w = Math.round(512 * (dims[0] / dims[1]));
        h = 512;
    }

    return ffmpegBuffer(
        `-loop 1 -t 17 -i $BUF0 -f lavfi -t 17 -i color=s=512x512:c=0x000000 -i ${file(
            "images/pepsi.mp3"
        )} -filter_complex "[0:v]scale=${w * 0.7}:${
            h * 0.7
        }[scaled];[scaled]split=4[sc_slide_br_tl][sc_scale_up_unscaled][sc_slide_l_r_unscaled][sc_scale_down_unscaled];[sc_slide_l_r_unscaled]scale=512:512[sc_slide_l_r];[sc_scale_up_unscaled]scale=iw*(1+t/20):ih*(1+t/20):eval=frame[sc_scale_up];[sc_scale_down_unscaled]scale=iw*(1-t/20):ih*(1-t/20):eval=frame[sc_scale_down];[1:v][sc_slide_br_tl]overlay=x=W/2-w/4-t*50:y=H/2-h/4-t*40[slide_br_tl];[1:v][sc_scale_up]overlay=x=W/2-w/2:y=H/2-h/2[scale_up];[1:v][sc_scale_down]overlay=x=W/2-w/2:y=H/2-h/2[scale_down];[1:v][sc_slide_l_r]overlay=x=-w/2+t*50:y=H/2-h/2[slide_l_r];[slide_br_tl][scale_up]xfade=duration=1:offset=3[slide_scale];[slide_scale][slide_l_r]xfade=duration=1:offset=8[slide1_scale1_slide2];[slide1_scale1_slide2][scale_down]xfade=duration=1:offset=13[out_v]" -map "[out_v]" -map "2:a:0" -t 17 -crf:v 51 -b:v 16k -preset:v ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
