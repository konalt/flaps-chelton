import { loadImage, createCanvas } from "canvas";
import { Shoebill } from "../../types";

const ShoebillW = 63;
const ShoebillH = 84;

export default async function createShoebillFrame(
    shoebills: Shoebill[],
    image: Buffer,
    overrideDims: [number, number] = [440, 228],
    overrideImageSize: [number, number] = [ShoebillW, ShoebillH]
) {
    let img = await loadImage(image);
    let c = createCanvas(overrideDims[0], overrideDims[1]);
    let ctx = c.getContext("2d");
    for (const { x, y, rotate, scaleFactor } of shoebills) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotate * (Math.PI / 180));
        ctx.scale(scaleFactor, scaleFactor);
        ctx.fillStyle = "black";
        ctx.fillRect(
            -overrideImageSize[0] / 2,
            -overrideImageSize[1] / 2,
            overrideImageSize[0],
            overrideImageSize[1]
        );
        ctx.drawImage(
            img,
            -overrideImageSize[0] / 2,
            -overrideImageSize[1] / 2,
            overrideImageSize[0],
            overrideImageSize[1]
        );
        ctx.restore();
    }
    return c.toBuffer();
}
