import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer, text: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let thisis = await loadImage("images/thisis.png");
        let img = await loadImage(buf);
        var c = createCanvas(thisis.width, thisis.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(thisis, 0, 0);
        var drawH = thisis.height - (thisis.height / 8) * 2.9;
        var drawW = drawH * (img.width / img.height);
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
        resolve(c.toBuffer("image/png"));
    });
};
