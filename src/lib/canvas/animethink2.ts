import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let anime = await loadImage("images/anime2.png");
        let image = await loadImage(buf);
        var c = createCanvas(499, 442);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 244, 0, 252, 230);
        ctx.drawImage(anime, 0, 0, 498, 482);
        resolve(c.toBuffer("image/png"));
    });
};
