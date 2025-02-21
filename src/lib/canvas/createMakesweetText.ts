import { createCanvas } from "canvas";
import { drawText } from "./drawText";

export default async function createMakesweetText(text: string) {
    let c = createCanvas(512, 512);
    let ctx = c.getContext("2d");
    ctx.fillStyle = "#dddddd";
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "normal normal bolder 50px sans-serif";
    await drawText(ctx, text, 256, 256, 480, false, "center");
    return c.toBuffer();
}
