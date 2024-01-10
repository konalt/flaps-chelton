import { loadImage, createCanvas } from "canvas";
import getTextWidth from "./getTextWidth";

export default (txt: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        let china = await loadImage("images/confucius.png");
        var c = createCanvas(china.width, china.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(china, 0, 0, china.width, china.height);
        var fac = 0;
        var grad = ctx.createLinearGradient(
            0,
            china.height,
            0,
            china.height * fac
        );
        grad.addColorStop(1, "rgba(0,0,0,0)");
        grad.addColorStop(0, "rgba(0,0,0,1)");
        ctx.fillStyle = grad;
        ctx.fillRect(
            0,
            china.height * fac,
            china.width,
            china.height * (1 - fac)
        );
        var font = "Fancy";
        var textArr = txt.split(" ");
        var size = china.height / 8;
        var cur: string[] = [];
        var lines: string[][] = [];
        textArr.forEach((text) => {
            var t: string[] = [...cur];
            t.push(text);
            if (getTextWidth(font, size, t.join(" ")) > china.width - 20 - 20) {
                lines.push([...cur]);
                cur = [text];
            } else {
                cur.push(text);
            }
        });
        lines.push(cur);
        ctx.font = size + "px " + font;
        lines.forEach((line, i) => {
            var co = 0;
            line.forEach((word) => {
                word.split("").forEach((char) => {
                    ctx.fillStyle = "white";
                    ctx.textAlign = "left";
                    ctx.fillText(
                        char,
                        20 + co,
                        (china.height / 5) * 3 + (i + 0.75) * size,
                        getTextWidth(font, size, char)
                    );
                    co += getTextWidth(font, size, char);
                });
                co += getTextWidth(font, size, " ");
            });
        });
        resolve(c.toBuffer("image/png"));
    });
};
