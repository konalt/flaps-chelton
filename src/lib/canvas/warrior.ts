import { loadImage, createCanvas } from "canvas";
import compressJPG from "../ffmpeg/compressjpg";
import { writeFile } from "fs/promises";
import { file } from "../ffmpeg/ffmpeg";
import { getFileName } from "../utils";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let fn = file("cache/" + getFileName("Temp_WarriorSave", "png"));
        await writeFile(fn, buf);
        let compressed = await compressJPG([[buf, fn]]);
        let warrior = await loadImage("images/warrior.png");
        let image = await loadImage(compressed);
        var c = createCanvas(warrior.width, warrior.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(warrior, 0, 0, warrior.width, warrior.height);
        ctx.drawImage(image, 19, 0, 74, 74);
        resolve(c.toBuffer("image/png"));
    });
};
