import { loadImage, createCanvas } from "canvas";

function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number
) {
    var ratio = maxWidth / srcWidth;
    return [srcWidth * ratio, srcHeight * ratio];
}

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let j1 = await loadImage("images/j1.png");
        let j2 = await loadImage("images/j2.png");
        let image = await loadImage(buf);
        let newsize = calculateAspectRatioFit(image.width, image.height, 145);
        let newpos = [569, 462 - newsize[1] / 2];
        var c = createCanvas(j1.width, j1.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(j1, 0, 0, j1.width, j1.height);
        ctx.drawImage(image, newpos[0], newpos[1], newsize[0], newsize[1]);
        ctx.drawImage(j2, 0, 0, j1.width, j1.height);
        resolve(c.toBuffer("image/png"));
    });
};
