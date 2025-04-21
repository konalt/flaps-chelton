import { loadImage, createCanvas, Canvas, ImageData } from "canvas";
import { calculateAspectRatioFit } from "../utils";
import cropImageToBounds from "./cropImageToBounds";

export default async (buf: Buffer): Promise<Buffer> => {
    let lore = await loadImage("images/loregift.png");
    let croppedCanvas = await cropImageToBounds(buf);
    let newsize = calculateAspectRatioFit(
        croppedCanvas.width,
        croppedCanvas.height,
        96,
        Infinity
    );
    let newpos = [96, 235 - newsize[1]];
    let c = createCanvas(lore.width, lore.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(lore, 0, 0, lore.width, lore.height);
    ctx.drawImage(croppedCanvas, newpos[0], newpos[1], newsize[0], newsize[1]);
    return c.toBuffer();
};
