import { loadImage, createCanvas } from "canvas";

function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxHeight: number
) {
    var ratio = maxHeight / srcHeight;
    return [srcWidth * ratio, srcHeight * ratio];
}

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let img = await loadImage(buf);
        var c = createCanvas(512, 512);
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#dddddd";
        ctx.fillRect(0, 0, 512, 512);
        let v = 100;
        if (img.width / img.height > 1.25) {
            v = 0;
        }
        let is = calculateAspectRatioFit(img.width, img.height, 512 - v);
        ctx.drawImage(img, 256 - is[0] / 2, v, is[0], is[1]);
        resolve(c.toBuffer("image/png"));
    });
};
