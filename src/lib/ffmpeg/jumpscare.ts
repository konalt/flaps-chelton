import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function pepsi(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    var dims = await getVideoDimensions(buffers[0]);
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
        `-loop 1 -i $BUF0 -f lavfi -t 3 -i color=s=512x512:c=0x000000 -i ${file(
            "images/jumpscare.mp3"
        )} -filter_complex "[0:v]scale=${w * 0.7}:${
            h * 0.7
        }[scaled];[scaled]scale=iw*((0.8+t)*0.9):ih*((0.8+t)*0.9):eval=frame[sc_scale_up];[1:v]split=2[vtoscale][vbg];[vtoscale][sc_scale_up]overlay=x=W/2-w/2:y=H/2-h/2[scary];
        [vbg][scary]xfade=offset=0.5:duration=2[out_v]" -map "[out_v]" -map "2:a:0" -t 1.75 $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
