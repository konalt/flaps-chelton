import { loadImage, createCanvas } from "canvas";

export default async function notification(buf: Buffer) {
    let anime = await loadImage("images/notification.png");
    let image = await loadImage(buf);
    let c = createCanvas(144, 110);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 21, 6, 98, 98);
    ctx.drawImage(anime, 0, 0, 144, 110);
    return c.toBuffer();
}
