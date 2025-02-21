import { loadImage, createCanvas } from "canvas";

export default async function animethink(buf: Buffer) {
    let anime = await loadImage("images/animethink.png");
    let image = await loadImage(buf);
    let c = createCanvas(anime.width, anime.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, anime.width, anime.height * 0.6);
    ctx.drawImage(anime, 0, 0, anime.width, anime.height);
    return c.toBuffer();
}
