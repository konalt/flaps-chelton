import { loadImage, createCanvas } from "canvas";

export default async function cheltonCo(buf: Buffer) {
    let cheltonco = await loadImage("images/cheltonco.png");
    let image = await loadImage(buf);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(cheltonco, 0, 0, image.width, image.height);
    return c.toBuffer();
}
