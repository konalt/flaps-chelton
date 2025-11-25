import { createCanvas } from "canvas";

export default function createSnowglobeGradient(w: number, h: number) {
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.scale(w / 100, h / 100);
    let grad = ctx.createRadialGradient(50, 50, 30, 50, 50, 100);
    grad.addColorStop(0, "rgba(236, 255, 254, 0)");
    grad.addColorStop(0.8, "rgba(236, 255, 254, 1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 100, 100);
    return c.toBuffer();
}
