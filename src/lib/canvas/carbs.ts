import { loadImage } from "canvas";
import { createCanvas } from "canvas";
import { cahWhiteCard } from "../cah";
import { sample } from "../utils";

export default (funny: boolean): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        var w = 960,
            h = 540,
            fontScaleFactor = 0.09;
        var c = createCanvas(w, h);
        var ctx = c.getContext("2d");
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
        var c = createCanvas(w, h);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, w, h);
        var card = cahWhiteCard(funny).replace(/__/g, "");
        ctx.fillStyle = "white";
        ctx.lineWidth = (h * fontScaleFactor) / 25;
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "normal normal bolder" + h * fontScaleFactor + "px Impact";
        ctx.fillText(card, w / 2, h * fontScaleFactor + 10, w);
        ctx.strokeText(card, w / 2, h * fontScaleFactor + 10, w);
        resolve(c.toBuffer("image/png"));
    });
};
