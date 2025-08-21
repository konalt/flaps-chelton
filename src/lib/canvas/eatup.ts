import { loadImage, createCanvas } from "canvas";
import { calculateAspectRatioFit } from "../utils";
import cropImageToBounds from "./cropImageToBounds";

// 330 262

export default async function frieren(buf: Buffer) {
    let bottom = await loadImage("images/eatup/bottom.png");
    let top = await loadImage("images/eatup/top.png");
    let croppedCanvas = await cropImageToBounds(buf);
    let newsize = calculateAspectRatioFit(
        croppedCanvas.width,
        croppedCanvas.height,
        437,
        250
    );
    const [w, h] = [bottom.width, bottom.height];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.drawImage(bottom, 0, 0);
    ctx.drawImage(
        croppedCanvas,
        340 - newsize[0] * 0.5,
        262 - newsize[1] * 0.9,
        ...newsize
    );
    ctx.drawImage(top, 0, 0);
    return c.toBuffer();
}
