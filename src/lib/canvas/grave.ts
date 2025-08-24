import { loadImage, createCanvas } from "canvas";
import blackwhite from "../ffmpeg/blackwhite";
import { drawText } from "./drawText";
import { ffmpegBuffer, file } from "../ffmpeg/ffmpeg";

const GRAVE_DIMENSIONS = [960, 665];
const GRAVE_PERSPECTIVE = [491, 186, 774, 180, 494, 526, 770, 525];

async function generateGraveImage(buf: Buffer) {
    let monochrome = await blackwhite([[buf, "png"]]);
    let img = await loadImage(monochrome);

    const [w, h] = [480, 600];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");

    const circleCenter: [number, number] = [w / 2, h / 3];
    const circleRadius = (h / 3) * 0.8;
    const circleEcc = 1.35;

    ctx.save();
    ctx.translate(...circleCenter);
    ctx.scale(circleEcc, 1);
    ctx.translate(...(circleCenter.map((n) => n * -1) as [number, number]));

    let gradient = ctx.createRadialGradient(
        ...circleCenter,
        0,
        ...circleCenter,
        circleRadius
    );
    gradient.addColorStop(0, "#000000ff");
    gradient.addColorStop(0.56, "#000000ff");
    gradient.addColorStop(1, "#00000000");
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(...circleCenter);
    ctx.arc(...circleCenter, circleRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(
        img,
        circleCenter[0] - circleRadius,
        circleCenter[1] - circleRadius,
        circleRadius * 2,
        circleRadius * 2
    );

    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "100px 'Cafe', cursive";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    drawText(ctx, "Gone too soon...", w / 2, (h / 5) * 4, w, false, "center");

    return c.toBuffer();
}

export default async function invertAlpha(buf: Buffer) {
    let graveImage = await generateGraveImage(buf);
    let out = await ffmpegBuffer(
        `-i $BUF0 -i ${file(
            "grave.png"
        )} -filter_complex "[0:v]eq=brightness=0.1:contrast=0.5,scale=${GRAVE_DIMENSIONS.join(
            ":"
        )},perspective=${GRAVE_PERSPECTIVE.join(
            ":"
        )}:sense=1[image];[1:v][image]overlay=x=0:y=0[out]" -map "[out]" $OUT`,
        [[graveImage, "png"]]
    );
    return out;
}
