import { loadImage, createCanvas } from "canvas";

export default async function createCollage(buffers: Buffer[]) {
    let imgSize = 512;
    let images = await Promise.all(buffers.map((i) => loadImage(i)));
    let w = imgSize * 2;
    let h = w;
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.fillStyle = "#24e632";
    ctx.fillRect(0, 0, w, h);
    let i = 0;
    for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
            if (images[i]) {
                ctx.drawImage(
                    images[i],
                    x * imgSize,
                    y * imgSize,
                    imgSize,
                    imgSize
                );
                i++;
            }
        }
    }
    return c.toBuffer();
}
