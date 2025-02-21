import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { cahWhiteCard } from "../cah";
import { sample } from "../utils";

export default async function carbs(funny: boolean) {
    let w = 512,
        h = 512,
        fontScaleFactor = 0.09;
    var images = [
        "yooo",
        "waow",
        "unbanned",
        "skeleton",
        "wh",
        "iron",
        "millerdaughter",
        "tired",
        "mime",
        "killnow",
        "gman",
        "baseball",
        "whnat",
        "cow",
    ];
    let image = await loadImage("images/" + sample(images) + ".png");
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, w, h);
    let card = cahWhiteCard(funny).replace(/__/g, "");
    ctx.fillStyle = "white";
    ctx.lineWidth = (h * fontScaleFactor) / 25;
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "normal normal bolder " + h * fontScaleFactor + "px Impact";
    ctx.fillText(card, w / 2, h * fontScaleFactor + 10, w);
    ctx.strokeText(card, w / 2, h * fontScaleFactor + 10, w);
    return c.toBuffer();
}
