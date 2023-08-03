import { loadImage, createCanvas } from "canvas";

function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number
) {
    var ratio = maxWidth / srcWidth;
    return [srcWidth * ratio, srcHeight * ratio];
}

export default (buf: Buffer): Promise<[Buffer, number]> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
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

        let arf = calculateAspectRatioFit(img.width, img.height, 512);

        let iw = Math.ceil(arf[0] / 2) * 2;
        let ih = Math.ceil(arf[1] / 2) * 2;

        let padSize = Math.ceil(fp.sides.tp.height / 2) * 2;
        var c = createCanvas(iw + padSize * 2, ih + padSize * 2);
        var ctx = c.getContext("2d");
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
        resolve([c.toBuffer("image/png"), padSize]);
    });
};
