import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let dalle2 = await loadImage("images/dalle2.png");
        let image = await loadImage(buf);
        var c = createCanvas(image.width, image.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        var dalle = {
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
        resolve(c.toBuffer("image/png"));
    });
};
