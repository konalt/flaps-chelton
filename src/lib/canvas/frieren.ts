import { loadImage, createCanvas, Canvas, ImageData } from "canvas";
import { calculateAspectRatioFit } from "../utils";

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

async function cropImageToBounds(imageBuffer: Buffer) {
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
    return c2;
}

export default async function frieren(buf: Buffer) {
    let background = await loadImage("images/frieren/frieren1.png");
    let fingers = await loadImage("images/frieren/frieren2.png");
    let croppedCanvas = await cropImageToBounds(buf);
    let newsize = calculateAspectRatioFit(
        croppedCanvas.width,
        croppedCanvas.height,
        69,
        Infinity
    );
    const [w, h] = [background.width, background.height];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.drawImage(background, 0, 0);
    ctx.save();
    ctx.translate(92, 230);
    ctx.rotate(3.4 * (Math.PI / 180));
    ctx.translate(-92, -230);
    ctx.drawImage(
        croppedCanvas,
        92 - newsize[0] / 2,
        230 - newsize[1] / 2,
        ...newsize
    );
    ctx.restore();
    ctx.drawImage(fingers, 52, 185);
    return c.toBuffer();
}
