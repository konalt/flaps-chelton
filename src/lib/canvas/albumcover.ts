import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let parentalimg = await loadImage("images/parental.png");
        let image = await loadImage(buf);
        var c = createCanvas(image.width, image.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0);
        var f = (image.width + image.height) / 2;
        var parental = {
            w: f * (108 / 540),
            h: f * (68 / 540),
            x: f * (29 / 540),
            y: f * (29 / 540),
        };
        ctx.drawImage(
            parentalimg,
            parental.x,
            image.height - parental.h - parental.y,
            parental.w,
            parental.h
        );
        resolve(c.toBuffer("image/png"));
    });
};
