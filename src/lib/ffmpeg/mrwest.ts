import { createCanvas, loadImage } from "canvas";
import { ffmpegBuffer, file } from "./ffmpeg";

async function getTweetImage(text: string) {
    const img = await loadImage(file("mrwest/tweet.png"));
    const c = createCanvas(img.width, img.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.font = "20px 'Open Sans', sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(text, 127, 50, 325);
    return c.toBuffer();
}

export default async function pepsi(
    buffers: [Buffer, string][],
    name: string
): Promise<Buffer> {
    let tweet = await getTweetImage(name);

    return ffmpegBuffer(
        [
            `-r 30 -loop 1 -t 16.4 -i $BUF0`,
            `-r 30 -loop 1 -t 16.4 -i $BUF1`,
            `-f lavfi -i color=s=512x512:c=0x000000:d=16.4:r=30`,
            `-i ${file("mrwest/audio.mp3")}`,
            `-r 30 -i ${file("mrwest/text/frame%02d.png")}`,
            ,
            ` -filter_complex "`,
            `[4:v]setpts=PTS-STARTPTS,setpts=PTS+2.6/TB[textvideo];`, // Offset text video by 2.6 seconds
            `[0:v]split=2[img][img_small];`, // Split image
            `[img]scale=512:512[img];`, // Scale image to 512x512 if not already
            `[img_small]scale=200:200[img_small];`, // Scale image down to 200x200 for small things
            `[2:v]split=4[black][tweet][slug1][slug2];`, // Split black video into tweet background and slug
            `[tweet][1:v]overlay=x=W/2-w/2:y=H/2-h/2[tweet];`, // Add tweet to black background
            `[black][tweet]xfade=duration=2:offset=-1[tweet];`, // Fade in from black
            `[tweet][img]overlay=x=0:y=0:enable='gt(n\\,78)'[base];`, // Add image above tweet from frame 78
            `[base][slug1]overlay=x=0:y=0:enable='gt(n\\,240)*lt(n\\,271)'[base];`, // Add slug between frames 240 and 271
            `[img_small]split=5[is_1][is_2][is_3][is_4][is_rest];`,
            `[base][is_1]overlay=x=0:y=0:enable='gt(n\\,295)*lt(n\\,347)'[base];`, // Add small images (#1)
            `[base][is_2]overlay=x=110:y=110:enable='gt(n\\,309)*lt(n\\,347)'[base];`, // Add small images (#2)
            `[base][is_3]overlay=x=210:y=210:enable='gt(n\\,322)*lt(n\\,347)'[base];`, // Add small images (#3)
            `[base][is_4]overlay=x=312:y=312:enable='gt(n\\,335)*lt(n\\,347)'[base];`, // Add small images (#4)
            `[is_rest]split=4[isr_1][isr_2][isr_3][isr_4];`,
            `[base][isr_1]overlay=x=312:y=0:enable='gt(n\\,398)'[base];`, // Add small images (#1)
            `[base][isr_2]overlay=x=210:y=110:enable='gt(n\\,411)'[base];`, // Add small images (#2)
            `[base][isr_3]overlay=x=110:y=210:enable='gt(n\\,424)'[base];`, // Add small images (#3)
            `[base][isr_4]overlay=x=0:y=312:enable='gt(n\\,436)'[base];`, // Add small images (#4)
            `[base][textvideo]overlay=x=0:y=0:enable='gt(n\\,78)*lt(n\\,171)'[base];`, // Add text
            `[base][slug2]xfade=offset=14.5:duration=1.5[base];`, // Add fade out
            `[base]null[out_v]" -map "[out_v]" -map "3:a:0" -r 30 -t 16.4 -crf:v 30 -b:v 96k $PRESET $OUT`,
        ].join(" "),
        [buffers[0], [tweet, "png"]],
        "mp4"
    );
}
