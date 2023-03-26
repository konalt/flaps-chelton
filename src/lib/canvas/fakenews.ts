import { loadImage, createCanvas } from "canvas";
import getTextWidth from "./getTextWidth";

export default (
    buf: Buffer,
    headline: string,
    ticker: string
): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        var [w, h] = [1280, 720];
        var img = await loadImage(buf);
        var c = createCanvas(w, h);
        var ctx = c.getContext("2d");
        // draw background image
        ctx.drawImage(img, 0, 0, w, h);
        // draw live indicator
        ctx.fillStyle = "#ff2d00";
        var textWidth = getTextWidth("sans-serif", 36, "LIVE");
        ctx.fillRect(80, 40, textWidth + 20, 50);
        // draw live text
        ctx.fillStyle = "white";
        ctx.font = "36px sans-serif";
        ctx.fillText("LIVE", 80 + 10, 79);
        // breaking news indicator
        ctx.fillStyle = "#ff2d00";
        var textWidth = getTextWidth("sans-serif", 48, "BREAKING NEWS");
        ctx.fillRect(80, 400 + 20, textWidth + 20, 54);
        // breaking news text
        ctx.fillStyle = "white";
        ctx.font = "48px sans-serif";
        ctx.fillText("BREAKING NEWS", 80 + 10, 400 + 48 + 15);
        // headline box
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillRect(80, 400 + 20 + 54, w, 150);
        // ticker box
        ctx.fillStyle = "yellow";
        ctx.fillRect(80, 400 + 20 + 54 + 150, w, 64);
        // clock box
        var time = new Date()
            .toISOString()
            .split("T")[1]
            .split(":")
            .slice(0, 2)
            .join(":");
        ctx.fillStyle = "black";
        var textWidth = getTextWidth("sans-serif", 36, time);
        ctx.fillRect(80, 400 + 20 + 54 + 150, textWidth + 20, 64);
        // clock text
        ctx.fillStyle = "white";
        ctx.font = "36px sans-serif";
        ctx.fillText(time, 80 + 10, 400 + 20 + 54 + 150 + 36 + 10);
        // ticker text
        ctx.fillStyle = "black";
        ctx.font = "36px sans-serif";
        ctx.fillText(
            ticker,
            80 + textWidth + 20 + 10,
            400 + 20 + 54 + 150 + 36 + 10
        );
        // headline text
        ctx.fillStyle = "black";
        ctx.font = "96px sans-serif";
        ctx.fillText(headline, 80 + 10, 400 + 20 + 54 + 96 + 10, w - 80 - 10);

        resolve(c.toBuffer());
    });
};
