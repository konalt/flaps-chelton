import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { drawText, getTextHeight } from "./drawText";

export default async function homodog(buf: Buffer | null, text: string) {
    let homodog = await loadImage(buf ?? "images/homophobicdog.png");
    let c = createCanvas(homodog.width, homodog.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(homodog, 0, 0, homodog.width, homodog.height);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.font = `normal normal bolder ${homodog.height / 7}px Homodog`;
    ctx.lineWidth = homodog.height / 240;
    let textHeight = getTextHeight(ctx, text, homodog.width * 0.9);
    await drawText(
        ctx,
        text,
        homodog.width / 2,
        homodog.height / 2 - textHeight / 2,
        homodog.width * 0.9,
        true
    );
    return c.toBuffer();
}
