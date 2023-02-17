import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let anime = await loadImage("images/animethink.png");
        let image = await loadImage(buf);
        var c = createCanvas(anime.width, anime.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, anime.width, anime.height * 0.6);
        ctx.drawImage(anime, 0, 0, anime.width, anime.height);
        resolve(c.toBuffer("image/png"));
    });
};
