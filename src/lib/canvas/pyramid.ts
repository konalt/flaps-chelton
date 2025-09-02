import { loadImage, createCanvas } from "canvas";

export default async function animethink(buf: Buffer) {
    let pyramid = await loadImage("images/pyramid.png");
    let image = await loadImage(buf);
    let c = createCanvas(pyramid.width, pyramid.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 10, 22, 1417, 1118);
    ctx.drawImage(pyramid, 0, 0, pyramid.width, pyramid.height);
    return c.toBuffer();
}
