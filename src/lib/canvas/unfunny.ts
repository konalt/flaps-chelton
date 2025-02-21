import { loadImage, createCanvas, ImageData } from "canvas";

function valueInRange(val: number, min: number, max: number) {
    return val >= min && val <= max;
}

function isWhite(pix: number[], cutoff: number) {
    cutoff = 255 - cutoff;
    return pix[0] > cutoff && pix[1] > cutoff && pix[2] > cutoff;
}

function isBlack(pix: number[], cutoff: number) {
    return pix[0] < cutoff && pix[1] < cutoff && pix[2] < cutoff;
}

function isGray(pix: number[], cutoff: number) {
    var redGreen = valueInRange(pix[0], pix[1] - cutoff, pix[1] + cutoff);
    var redBlue = valueInRange(pix[0], pix[2] - cutoff, pix[2] + cutoff);
    return redGreen && redBlue;
}

const unfunnyCutoff = 10;

export default async function unfunny(buf: Buffer) {
    let funny = await loadImage("images/saul.png");
    let image = await loadImage(buf);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    let readIndex = 0;
    let curPix = [-1, -1, -1, -1];
    let imageData2: number[][] = [];
    let backgroundCanvas = createCanvas(ctx.canvas.width, ctx.canvas.height);
    let bgCtx = backgroundCanvas.getContext("2d");
    bgCtx.drawImage(funny, 0, 0, ctx.canvas.width, ctx.canvas.height);
    let bg = bgCtx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    Array.from(imageData.data).forEach((element, index) => {
        curPix[readIndex] = element;
        if (!curPix.includes(-1)) {
            if (
                !isBlack(curPix, unfunnyCutoff) &&
                !isWhite(curPix, unfunnyCutoff) &&
                !isGray(curPix, unfunnyCutoff)
            ) {
                curPix = [
                    bg.data[index - 3],
                    bg.data[index - 2],
                    bg.data[index - 1],
                    bg.data[index],
                ];
            }
        }
        readIndex++;
        if (readIndex == 4) {
            imageData2.push([...curPix]);
            curPix = [-1, -1, -1, -1];
            readIndex = 0;
        }
    });
    let imageData3: number[] = [];
    imageData2.forEach((pixel) => {
        imageData3.push(pixel[0]);
        imageData3.push(pixel[1]);
        imageData3.push(pixel[2]);
        imageData3.push(pixel[3]);
    });
    let imageData4 = new ImageData(
        new Uint8ClampedArray(imageData3),
        ctx.canvas.width,
        ctx.canvas.height
    );
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(funny, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData4, 0, 0);
    return c.toBuffer();
}
