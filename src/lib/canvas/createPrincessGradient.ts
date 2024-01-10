import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let img = await loadImage(buf);
        var c = createCanvas(img.width, img.height);
        var ctx = c.getContext("2d");
        ctx.scale(img.width / 100, img.height / 100);
        var grad = ctx.createRadialGradient(50, 50, 30, 50, 50, 100);
        grad.addColorStop(0, "rgba(250, 145, 231, 0.3)");
        grad.addColorStop(1, "rgba(255, 130, 205, 0.8)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 100, 100);
        resolve(c.toBuffer("image/png"));
    });
};
