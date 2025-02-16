import { loadImage, createCanvas } from "canvas";

export default async (buffer: Buffer) => {
    let image = await loadImage(buffer);
    let [w, h] = [image.width, image.height];
    let scaler = (w + h) / 2;
    const speechMargin = 0.05 * scaler;
    const speechArrowStart = 0.15 * scaler;
    const speechArrowPointX = 0.4 * scaler;
    const speechArrowPointY = 0.2 * scaler;
    const speechArrowEnd = 0.35 * scaler;
    let c = createCanvas(w, h + speechMargin);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, speechMargin, w, h);
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-10, speechMargin);
    ctx.lineTo(speechArrowStart, speechMargin);
    ctx.lineTo(speechArrowPointX, speechArrowPointY);
    ctx.lineTo(speechArrowEnd, speechMargin);
    ctx.lineTo(w + 10, speechMargin);
    ctx.lineTo(w + 10, 0);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.01 * scaler;
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    return c.toBuffer();
};
