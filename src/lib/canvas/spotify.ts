import { loadImage, createCanvas } from "canvas";

export default async function spotify(buf: Buffer, text: string) {
    let thisis = await loadImage("images/thisis.png");
    let img = await loadImage(buf);
    let c = createCanvas(thisis.width, thisis.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(thisis, 0, 0);
    let drawH = thisis.height - (thisis.height / 8) * 2.9;
    let drawW = drawH * (img.width / img.height);
    ctx.drawImage(
        img,
        thisis.width / 2 - drawW / 2,
        thisis.height - drawH,
        drawW,
        drawH
    );
    ctx.font = thisis.height / 10 + "px Spotify";
    ctx.textAlign = "center";
    ctx.fillText(text, thisis.width / 2, (thisis.height / 8) * 2.3);
    return c.toBuffer();
}
