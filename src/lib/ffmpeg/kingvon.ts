import { createCanvas, loadImage } from "canvas";
import { ffmpegBuffer, file } from "./ffmpeg";

async function createText(text: string) {
    const image = await loadImage(file("kingvon_text.png"));
    const c = createCanvas(image.width, image.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0);
    ctx.font = "bold 52px 'Open Sans', sans-serif";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    let measurements = ctx.measureText(text);
    ctx.translate(161, 8);
    ctx.scale(
        155 / measurements.width,
        60 / measurements.actualBoundingBoxDescent
    );
    ctx.fillText(text, 0, 0);
    return c.toBuffer();
}

export default async function mark(
    buffers: [Buffer, string][],
    text = "this mf"
) {
    let bottom = buffers[0];
    let top = buffers[0];
    if (buffers[1]) {
        top = buffers[1];
    }
    let textImage = await createText(text);
    return ffmpegBuffer(
        `-i ${file(
            "kingvon.mp4"
        )} -i $BUF0 -i $BUF1 -i $BUF2 -filter_complex "[0:v]scale=1080:880,setsar=1:1[t];[1:v]scale=1080:880,setsar=1:1[j];[2:v]scale=1080:880,setsar=1:1[i];[t]colorkey=0xFF00FF:0.2:0.2[m];[i][m]overlay=0:0[o];[o][j]vstack[s];[s][3:v]overlay=W/2-w/2:H/2-h/2[o];[0:a]anull[a]" -map "[o]" -map "[a]" -shortest $PRESET $OUT`,
        [bottom, top, [textImage, "png"]],
        "mp4"
    );
}
