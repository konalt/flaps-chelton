import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer, override: number = 512): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let image = await loadImage(buf);
        var c = createCanvas(override, override);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, override, override);
        resolve(c.toBuffer("image/png"));
    });
};
