import { createCanvas } from "canvas";

export default async function createNoise(
    w: number,
    h: number,
    intensity: number
) {
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    let imageData = ctx.createImageData(w, h);
    let d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        let value = Math.random() * 255;
        d[i] = value;
        d[i + 1] = value;
        d[i + 2] = value;
        d[i + 3] = intensity * 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return c.toBuffer();
}
