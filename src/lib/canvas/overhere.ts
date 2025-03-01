import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { drawText } from "./drawText";
import { readFileSync } from "fs";
import { calculateAspectRatioFit } from "../utils";

function parseData(text: string) {
    return text.split("\n").map((n) => n.split(" ").map((r) => parseInt(r)));
}

const positions = parseData(readFileSync("images/data/overhere.dat", "utf8"));

export default async function overhere(buf: Buffer, text: string) {
    let overhere = await loadImage("images/overhere.png");
    let image = await loadImage(buf);
    let newDimensions = calculateAspectRatioFit(
        image.width,
        image.height,
        overhere.width,
        Infinity
    );
    let c = createCanvas(overhere.width, overhere.height + newDimensions[1]);
    let ctx = c.getContext("2d");
    ctx.drawImage(overhere, 0, 0);
    ctx.drawImage(
        image,
        0,
        overhere.height,
        newDimensions[0],
        newDimensions[1]
    );
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    for (const pos of positions) {
        ctx.font = `bold ${pos[3]}px 'Open Sans', sans-serif`;
        let tw = ctx.measureText(text).width;
        ctx.save();
        ctx.translate(pos[0], pos[1] - 50);
        ctx.scale(pos[2] / tw, 1);
        await drawText(ctx, text, 0, 0, Infinity);
        ctx.restore();
    }
    return c.toBuffer();
}
