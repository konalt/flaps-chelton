import { ffmpegBuffer, file, gifPalette } from "./ffmpeg";

export default function petpet(buffers: [Buffer, string][]) {
    let fps = 24;
    return ffmpegBuffer(
        `-framerate ${fps} -t 1 -loop 1 -i $BUF0 -framerate ${fps} -i ${file(
            "petpet/petpet%02d.png"
        )} -filter_complex
    "color=0xffffff:s=112x112:d=1[whitebg];
    [0:v]scale=-1:90[img_scaled_noanims];
    [img_scaled_noanims]scale=(
        if(eq(n\\,0)\\,1.00\\,
        if(eq(n\\,1)\\,1.05\\,
        if(eq(n\\,2)\\,1.10\\,
        if(eq(n\\,3)\\,1.05\\,
        if(eq(n\\,4)\\,1.00\\,
        1.00)))))
    )*iw:(
        if(eq(n\\,0)\\,1.00\\,
        if(eq(n\\,1)\\,0.90\\,
        if(eq(n\\,2)\\,0.75\\,
        if(eq(n\\,3)\\,0.90\\,
        if(eq(n\\,4)\\,1.00\\,
        1.00)))))
    )*ih:eval=frame[img_scaled];
    [whitebg][img_scaled]overlay=x=70-overlay_w/2:y=main_h-overlay_h+1[bg_img];
    [bg_img][1:v]overlay=x=0:y=0[out_v_noscale];
    [out_v_noscale]scale=256:256[out_v_nopal];
    ${gifPalette("out_v_nopal", "out_v")}"
    -map "[out_v]"
    -frames:v 5
    -loop 0
    $OUT`,
        buffers,
        "gif"
    );
}
