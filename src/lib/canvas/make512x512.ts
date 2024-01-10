import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let image = await loadImage(buf);
        var c = createCanvas(512, 512);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, 512, 512);
        resolve(c.toBuffer("image/png"));
    });
};
