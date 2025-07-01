import { createCanvas } from "canvas";

export default async function createMakesweetText(text: string) {
    const [w, h] = [800, 200];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "900 200px 'Arial Black'";
    ctx.textBaseline = "top";
    let measure = ctx.measureText(text);
    let scaleX = w / measure.width;
    let scaleY = h / (measure.actualBoundingBoxDescent * 0.75);
    ctx.translate(w / 2, 0);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-w / 2, 0);
    ctx.fillText(text, w / 2, -h / 3, w);
    return c.toBuffer();
}
