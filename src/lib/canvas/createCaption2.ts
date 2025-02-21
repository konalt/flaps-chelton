import { createCanvas } from "canvas";
import { parseOptions } from "../utils";
import { drawText, getTextHeight, lineHeight } from "./drawText";

const defaultFont = '"Futura Condensed Extra", sans-serif';
const defaults = {
    background: "#ffffff",
    text: "#000000",
    invert: false,
};

export default async function createCaption2(
    width: number,
    height: number,
    textFull: string
): Promise<Buffer> {
    let [options, text] = parseOptions(textFull, defaults);
    let c = createCanvas(width, width);
    let ctx = c.getContext("2d");
    let fontSize = Math.round(((width + height) / 2) * 0.1);
    ctx.font = `${fontSize}px ${defaultFont}`;
    let outHeight = getTextHeight(ctx, text, c.width * 0.9);
    let yPadding = lineHeight(ctx) * 0.4;
    c.height = outHeight + yPadding * 2;
    ctx.fillStyle = options.invert ? options.text : options.background;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${fontSize}px ${defaultFont}`;
    ctx.textAlign = "center";
    ctx.fillStyle = options.invert ? options.background : options.text;
    await drawText(ctx, text, c.width / 2, yPadding, c.width * 0.9);
    return c.toBuffer();
}
