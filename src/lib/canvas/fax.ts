import { loadImage, createCanvas } from "canvas";
import cropImageToBounds from "./cropImageToBounds";

export default async function fax(buf: Buffer) {
    let base = await loadImage("images/fax.png");
    let cropped = await cropImageToBounds(buf);
    const [w, h] = [base.width, base.height];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.drawImage(base, 0, 0, w, h);
    ctx.drawImage(cropped, 435, 301, 307, 560);
    return c.toBuffer();
}
