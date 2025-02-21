import { loadImage, createCanvas } from "canvas";
import compressJPGExtreme from "../ffmpeg/compressjpgextreme";

export default async function warrior(buf: Buffer) {
    let compressed = await compressJPGExtreme([[buf, "png"]]);
    let warrior = await loadImage("images/warrior.png");
    let image = await loadImage(compressed);
    let c = createCanvas(warrior.width, warrior.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(warrior, 0, 0, warrior.width, warrior.height);
    ctx.drawImage(image, 19, 0, 74, 74);
    return c.toBuffer();
}
