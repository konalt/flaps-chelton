import { loadImage, createCanvas } from "canvas";
import { Shoebill } from "../../types";

const ShoebillW = 63;
const ShoebillH = 84;

export default (shoebills: Shoebill[], image: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        let img = await loadImage(image);
        let c = createCanvas(400, 228);
        let ctx = c.getContext("2d");
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        for (const { x, y, rotate, scaleFactor } of shoebills) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotate * (Math.PI / 180));
            ctx.scale(scaleFactor, scaleFactor);
            ctx.drawImage(
                img,
                -ShoebillW / 2,
                -ShoebillH / 2,
                ShoebillW,
                ShoebillH
            );
            ctx.restore();
        }
        ctx.font = "24px monospace";
        resolve(c.toBuffer("image/png"));
    });
};
