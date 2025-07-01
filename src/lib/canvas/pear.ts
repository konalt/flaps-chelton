import { loadImage, createCanvas } from "canvas";
import { calculateAspectRatioFit } from "../utils";
import { file } from "../ffmpeg/ffmpeg";

export default async (buf: Buffer): Promise<Buffer> => {
    const img = await loadImage(buf);
    const pear = await loadImage(file("pear.png"));
    const gCanvas = createCanvas(400, 400);
    const gCtx = gCanvas.getContext("2d");
    const gRadial = gCtx.createRadialGradient(200, 200, 130, 200, 200, 200);
    gRadial.addColorStop(0, "black");
    gRadial.addColorStop(1, "transparent");
    gCtx.fillStyle = gRadial;
    gCtx.fillRect(0, 0, 400, 400);
    gCtx.globalCompositeOperation = "source-in";
    gCtx.drawImage(img, 0, 0, 400, 400);
    const canvas = createCanvas(pear.width, pear.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(pear, 0, 0, pear.width, pear.height);
    const [nw, nh] = calculateAspectRatioFit(img.width, img.height, 190, 220);
    ctx.drawImage(gCanvas, 125 - nw * 0.25, 365 - nh / 2, nw, nh);
    return canvas.toBuffer();
};
