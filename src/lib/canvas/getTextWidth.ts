import { createCanvas } from "canvas";

export default function getTextWidth(
    font: string,
    fontsize: number,
    text: string
) {
    let c = createCanvas(fontsize, fontsize);
    let ctx = c.getContext("2d");
    ctx.font = fontsize + "px " + font;
    let w = ctx.measureText(text).width;
    return w;
}
