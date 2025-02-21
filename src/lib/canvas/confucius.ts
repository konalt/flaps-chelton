import { loadImage, createCanvas } from "canvas";
import { drawText } from "./drawText";

export default async function confucius(txt: string) {
    let china = await loadImage("images/confucius.png");
    let c = createCanvas(china.width, china.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(china, 0, 0, china.width, china.height);
    let fac = 0;
    let grad = ctx.createLinearGradient(
        0,
        china.height,
        china.width * 0.1,
        china.height * fac
    );
    grad.addColorStop(1, "rgba(0,0,0,0)");
    grad.addColorStop(0, "rgba(0,0,0,1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, china.height * fac, china.width, china.height * (1 - fac));
    ctx.font = `${china.height * 0.15}px Fancy`;
    ctx.fillStyle = "white";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    await drawText(
        ctx,
        txt,
        china.width * 0.05,
        china.height / 2,
        china.width * 0.9
    );
    return c.toBuffer();
}
