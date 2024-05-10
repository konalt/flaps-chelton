import { loadImage, createCanvas } from "canvas";
import compressJPGExtreme from "../ffmpeg/compressjpgextreme";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let compressed = await compressJPGExtreme([[buf, "png"]]);
        let warrior = await loadImage("images/warrior.png");
        let image = await loadImage(compressed);
        var c = createCanvas(warrior.width, warrior.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(warrior, 0, 0, warrior.width, warrior.height);
        ctx.drawImage(image, 19, 0, 74, 74);
        resolve(c.toBuffer("image/png"));
    });
};
