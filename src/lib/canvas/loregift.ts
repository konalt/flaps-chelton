import { loadImage, createCanvas, Canvas, ImageData } from "canvas";

function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number
) {
    var ratio = maxWidth / srcWidth;
    return [srcWidth * ratio, srcHeight * ratio];
}

function getImageBounds(imageData: ImageData) {
    let threshold = 4;
    let sx = Infinity;
    let sy = Infinity;
    let ex = 0;
    let ey = 0;
    let iw = imageData.width;
    let ih = imageData.height;
    let data = imageData.data;
    for (let y = 0; y < ih; ++y) {
        for (let x = 0; x < iw; ++x) {
            let index = (y * iw + x) * 4;
            let alpha = data[index + 3];
            if (alpha > threshold) {
                sx = Math.min(x, sx);
                sy = Math.min(y, sy);
                ex = Math.max(x, ex);
                ey = Math.max(y, ey);
            }
        }
    }
    return [sx, sy, ex - sx, ey - sy];
}

async function cropImageToBounds(imageBuffer: Buffer): Promise<Canvas> {
    return new Promise(async (res, rej) => {
        let image = await loadImage(imageBuffer);
        let c = createCanvas(image.width, image.height);
        let ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0);
        let imageData = ctx.getImageData(0, 0, image.width, image.height);
        let [x, y, w, h] = getImageBounds(imageData);
        let newImageData = ctx.getImageData(x, y, w, h);
        let c2 = createCanvas(w, h);
        let ctx2 = c2.getContext("2d");
        ctx2.putImageData(newImageData, 0, 0);
        res(c2);
    });
}

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let lore = await loadImage("images/loregift.png");
        let croppedCanvas = await cropImageToBounds(buf);
        let newsize = calculateAspectRatioFit(
            croppedCanvas.width,
            croppedCanvas.height,
            96
        );
        let newpos = [96, 235 - newsize[1]];
        var c = createCanvas(lore.width, lore.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(lore, 0, 0, lore.width, lore.height);
        ctx.drawImage(
            croppedCanvas,
            newpos[0],
            newpos[1],
            newsize[0],
            newsize[1]
        );
        resolve(c.toBuffer("image/png"));
    });
};
