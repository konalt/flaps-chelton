import { createCanvas } from "canvas";

export default function getTextWidth(
    font: string,
    fontsize: number,
    text: string
) {
    var c = createCanvas(fontsize, fontsize);
    var ctx = c.getContext("2d");
    ctx.font = fontsize + "px " + font;
    var w = ctx.measureText(text).width;
    return w;
}
