import { loadImage, createCanvas } from "canvas";

export default async function political(buf: Buffer) {
    let base = await loadImage("images/political.png");
    let image = await loadImage(buf);
    const [w, h] = [base.width, base.height];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.save();
    ctx.translate(382, 410);
    ctx.rotate(-3.76 * (Math.PI / 180));
    ctx.translate(-382, -410);
    ctx.drawImage(image, 116, 272, 532, 277);
    ctx.restore();
    ctx.drawImage(base, 0, 0, w, h);
    return c.toBuffer();
}
