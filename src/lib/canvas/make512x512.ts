import { loadImage, createCanvas } from "canvas";

export default async function make512x512(buf: Buffer, override: number = 512) {
    let image = await loadImage(buf);
    let c = createCanvas(override, override);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, override, override);
    return c.toBuffer();
}
