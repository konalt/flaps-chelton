import { loadImage, createCanvas } from "canvas";
import { calculateAspectRatioFit } from "../utils";
import cropImageToBounds from "./cropImageToBounds";

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
