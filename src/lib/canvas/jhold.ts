import { loadImage, createCanvas, Canvas, ImageData } from "canvas";
import { calculateAspectRatioFit } from "../utils";
import cropImageToBounds from "./cropImageToBounds";

export default async function jHold(buf: Buffer) {
    let j1 = await loadImage("images/j1.png");
    let jh = await loadImage("images/jhand_3.png");
    let j2 = await loadImage("images/j2_3.png");
    let croppedCanvas = await cropImageToBounds(buf);
    let newsize = calculateAspectRatioFit(
        croppedCanvas.width,
        croppedCanvas.height,
        145,
        Infinity
    );
    let newpos = [569, 462 - newsize[1] / 2];
    let c = createCanvas(j1.width, j1.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(j1, 0, 0, j1.width, j1.height);
    ctx.drawImage(jh, 0, 0, j1.width, j1.height);
    ctx.drawImage(croppedCanvas, newpos[0], newpos[1], newsize[0], newsize[1]);
    ctx.drawImage(j2, 0, 0, j1.width, j1.height);
    return c.toBuffer();
}
