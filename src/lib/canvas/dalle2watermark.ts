import { loadImage, createCanvas } from "canvas";

export default async function dalle2Watermark(buf: Buffer) {
    let dalle2 = await loadImage("images/dalle2.png");
    let image = await loadImage(buf);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    let dalle = {
        w: image.width * (80 / 1024),
        h: image.width * (16 / 1024),
    };
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        dalle2,
        image.width - dalle.w,
        image.height - dalle.h,
        dalle.w,
        dalle.h
    );
    return c.toBuffer();
}
