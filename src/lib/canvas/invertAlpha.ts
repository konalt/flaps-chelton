import { loadImage, createCanvas } from "canvas";

export default async function invertAlpha(buf: Buffer) {
    let img = await loadImage(buf);
    let c = createCanvas(img.width, img.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    let data = ctx.getImageData(0, 0, img.width, img.height);
    let d = data.data;
    for (let i = 0; i < d.length; i += 4) {
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = Math.abs(255 - d[i + 3]);
    }
    ctx.clearRect(0, 0, img.width, img.height);
    ctx.putImageData(data, 0, 0);
    return c.toBuffer();
}
