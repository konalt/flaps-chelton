import { bufferToDataURL, calculateAspectRatioFit, rgbToHex } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";
import { createCanvas, loadImage } from "canvas";
import { drawText } from "../canvas/drawText";
import { RGBColor } from "../../types";

async function anim(image: Buffer, color: RGBColor) {
    let animation = await hookWeb3DAPIAnimation("shampoo", {
        img: bufferToDataURL(image, "image/png"),
        color: [color.r * 0.2, color.g * 0.2, color.b * 0.2],
    });
    let animationFrames: Buffer[] = [];
    const animLength = 250;
    for (let i = 0; i < animLength; i++) {
        animationFrames.push(await animation.step(i));
    }
    animation.destroy();
    let animationSequence = addBufferSequence(animationFrames, "png");
    let animationConcat = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${animationSequence} -framerate 60 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(animationSequence);
    return animationConcat;
}

async function createShampooImage(buffer: Buffer, color: RGBColor) {
    const img = await loadImage(buffer);

    const w = 1400;
    const h = w;
    const c = createCanvas(w, h);
    const ctx = c.getContext("2d");

    // White border rectangles
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w * 0.025, h);
    ctx.fillRect(w * 0.975, 0, w * 0.025, h);
    ctx.fillStyle = rgbToHex(color);
    ctx.fillRect(0, h * 0.25, w * 0.025, h * 0.5);
    ctx.fillRect(w * 0.975, h * 0.25, w * 0.025, h * 0.5);

    // Front
    ctx.fillStyle = "white";
    ctx.font = "bold 256px 'Cafe', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 3;
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    await drawText(ctx, "Shampoo", w / 2, (h / 4) * 3, w / 2);
    ctx.shadowColor = "transparent";

    // Centered Image
    const cid = calculateAspectRatioFit(
        img.width * 10,
        img.height * 10,
        w * 0.8,
        h * 0.7
    );
    const cic = [w / 2, h * 0.4];
    ctx.drawImage(
        img,
        cic[0] - cid[0] / 2,
        cic[1] - cid[1] / 2,
        cid[0],
        cid[1]
    );

    return c.toBuffer();
}

export default async function shampoo(
    buffers: [Buffer, string][],
    color: RGBColor
) {
    let labelImage = await createShampooImage(buffers[0][0], color);
    let animation = await anim(labelImage, color);
    return animation;
}
