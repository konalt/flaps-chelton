import { loadImage, createCanvas } from "canvas";

export default async function createPrincessGradient(buf: Buffer) {
    let img = await loadImage(buf);
    let c = createCanvas(img.width, img.height);
    let ctx = c.getContext("2d");
    ctx.scale(img.width / 100, img.height / 100);
    let grad = ctx.createRadialGradient(50, 50, 30, 50, 50, 100);
    grad.addColorStop(0, "rgba(250, 145, 231, 0.3)");
    grad.addColorStop(1, "rgba(255, 130, 205, 0.8)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 100, 100);
    return c.toBuffer();
}
