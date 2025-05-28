import { loadImage, createCanvas } from "canvas";
import { calculateAspectRatioFit, clamp } from "../utils";

export default async function createNoisyImage(buf: Buffer, intensity: number) {
    let img = await loadImage(buf);
    let c = createCanvas(img.width, img.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let imageData = ctx.getImageData(0, 0, img.width, img.height);
    let d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        let value = Math.random() * intensity - intensity / 2;
        d[i] = clamp(d[i] + value, 0, 255);
        d[i + 1] = clamp(d[i + 1] + value, 0, 255);
        d[i + 2] = clamp(d[i + 2] + value, 0, 255);
    }
    ctx.putImageData(imageData, 0, 0);
    return c.toBuffer();
}
