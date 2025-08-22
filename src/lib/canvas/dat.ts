import { loadImage, createCanvas } from "canvas";
import { drawText } from "./drawText";
import createNoise from "./createNoise";

export default async function dat(imageBuffer: Buffer, text: string) {
    let image = await loadImage(imageBuffer);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.font = `${image.height * 0.09}px Papyrus`;
    ctx.fillStyle = "white";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.textAlign = "center";
    await drawText(
        ctx,
        text,
        image.width * 0.6,
        image.height * 0.7,
        image.width * 0.9,
        false,
        "top",
        0.6
    );
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    let noiseScale = 1.2;
    let noise = await loadImage(
        await createNoise(
            image.width / noiseScale,
            image.height / noiseScale,
            0.3
        )
    );
    ctx.drawImage(noise, 0, 0, image.width, image.height);
    return c.toBuffer();
}
