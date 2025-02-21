import { loadImage, createCanvas } from "canvas";
import { calculateAspectRatioFit } from "../utils";

export default async function createFrame(buf: Buffer) {
    let img = await loadImage(buf);
    let fp = {
        sides: {
            tp: await loadImage("images/frameside_top.png"),
            bt: await loadImage("images/frameside_bottom.png"),
            lf: await loadImage("images/frameside_left.png"),
            rt: await loadImage("images/frameside_right.png"),
        },
        corners: {
            bl: await loadImage("images/framecorner_bottomleft.png"),
            br: await loadImage("images/framecorner_bottomright.png"),
            tl: await loadImage("images/framecorner_topleft.png"),
            tr: await loadImage("images/framecorner_topright.png"),
        },
    };

    let arf = calculateAspectRatioFit(img.width, img.height, 768, 768);

    let iw = Math.floor(arf[0] / 2) * 2;
    let ih = Math.floor(arf[1] / 2) * 2;

    let padSize = Math.floor(fp.sides.tp.height / 2) * 2;
    let c = createCanvas(iw + padSize * 2, ih + padSize * 2);
    let ctx = c.getContext("2d");
    // Corners
    ctx.drawImage(fp.corners.tl, 0, 0, padSize, padSize);
    ctx.drawImage(fp.corners.tr, iw + padSize, 0);
    ctx.drawImage(fp.corners.bl, 0, ih + padSize);
    ctx.drawImage(fp.corners.br, iw + padSize, ih + padSize);
    // Sides
    ctx.drawImage(fp.sides.tp, padSize, 0, iw, padSize);
    ctx.drawImage(fp.sides.bt, padSize, ih + padSize, iw, padSize);
    ctx.drawImage(fp.sides.lf, 0, padSize, padSize, ih);
    ctx.drawImage(fp.sides.rt, iw + padSize, padSize, padSize, ih);
    return c.toBuffer();
}
