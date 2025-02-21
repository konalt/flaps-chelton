import { loadImage, createCanvas } from "canvas";
import { calculateAspectRatioFit } from "../utils";

export default async function createMakesweetFixedImage(buf: Buffer) {
    let img = await loadImage(buf);
    let c = createCanvas(512, 512);
    let ctx = c.getContext("2d");
    ctx.fillStyle = "#dddddd";
    ctx.fillRect(0, 0, 512, 512);
    let v = 100;
    if (img.width / img.height > 1.25) {
        v = 0;
    }
    let is = calculateAspectRatioFit(img.width, img.height, 512 - v, 512 - v);
    ctx.drawImage(img, 256 - is[0] / 2, v, is[0], is[1]);
    return c.toBuffer();
}
