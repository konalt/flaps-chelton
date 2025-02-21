import { loadImage, createCanvas } from "canvas";
import getTextWidth from "./getTextWidth";

export default async function fakeNews(
    buf: Buffer,
    headline: string,
    ticker: string
) {
    let [w, h] = [1280, 720];
    let img = await loadImage(buf);
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    // draw background image
    ctx.drawImage(img, 0, 0, w, h);
    // draw live indicator
    ctx.fillStyle = "#ff2d00";
    let liveWidth = getTextWidth("sans-serif", 36, "LIVE");
    ctx.font = "36px sans-serif";
    ctx.fillRect(80, 40, liveWidth + 20, 50);
    // draw live text
    ctx.fillStyle = "white";
    ctx.fillText("LIVE", 80 + 10, 79);
    // breaking news indicator
    ctx.fillStyle = "#ff2d00";
    let breakingNewsWidth = getTextWidth("sans-serif", 48, "BREAKING NEWS");
    ctx.font = "48px sans-serif";
    ctx.fillRect(80, 400 + 20, breakingNewsWidth + 20, 54);
    // breaking news text
    ctx.fillStyle = "white";
    ctx.fillText("BREAKING NEWS", 80 + 10, 400 + 48 + 15);
    // headline box
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(80, 400 + 20 + 54, w, 150);
    // ticker box
    ctx.fillStyle = "yellow";
    ctx.fillRect(80, 400 + 20 + 54 + 150, w, 64);
    // clock box
    let time = new Date()
        .toISOString()
        .split("T")[1]
        .split(":")
        .slice(0, 2)
        .join(":");
    ctx.fillStyle = "black";
    let timeWidth = getTextWidth("sans-serif", 36, time);
    ctx.font = "36px sans-serif";
    ctx.fillRect(80, 400 + 20 + 54 + 150, timeWidth + 20, 64);
    // clock text
    ctx.fillStyle = "white";
    ctx.fillText(time, 80 + 10, 400 + 20 + 54 + 150 + 36 + 10);
    // ticker text
    ctx.fillStyle = "black";
    ctx.font = "36px sans-serif";
    ctx.fillText(
        ticker,
        80 + timeWidth + 20 + 10,
        400 + 20 + 54 + 150 + 36 + 10
    );
    // headline text
    ctx.fillStyle = "black";
    ctx.font = "96px sans-serif";
    ctx.fillText(headline, 80 + 10, 400 + 20 + 54 + 96 + 10, w - 80 - 10);
    return c.toBuffer();
}
