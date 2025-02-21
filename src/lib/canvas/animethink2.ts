import { loadImage, createCanvas } from "canvas";

export default async function animethink2(buf: Buffer) {
    let anime = await loadImage("images/anime2.png");
    let image = await loadImage(buf);
    let c = createCanvas(499, 442);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 244, 0, 252, 230);
    ctx.drawImage(anime, 0, 0, 498, 482);
    return c.toBuffer();
}
