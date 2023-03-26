import { loadImage, createCanvas } from "canvas";
import getTextWidth from "./getTextWidth";

export default (buf: Buffer, txt: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let andrew = await loadImage("images/tate.jpg");
        let image = await loadImage(buf);
        var c = createCanvas(andrew.width, andrew.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(andrew, 0, 0, andrew.width, andrew.height);
        ctx.drawImage(
            image,
            0,
            andrew.height / 2,
            andrew.width,
            andrew.height / 2
        );
        var fac = 0;
        var grad = ctx.createLinearGradient(
            0,
            andrew.height,
            0,
            andrew.height * fac
        );
        grad.addColorStop(1, "rgba(0,0,0,0)");
        grad.addColorStop(0, "rgba(0,0,0,0.7)");
        ctx.fillStyle = grad;
        ctx.fillRect(
            0,
            andrew.height * fac,
            andrew.width,
            andrew.height * (1 - fac)
        );
        var textArr = txt.split(" ");
        var size = andrew.height / 8;
        var cur: string[] = [];
        var lines: string[][] = [];
        textArr.forEach((text) => {
            var t: string[] = [...cur];
            t.push(text);
            if (getTextWidth("Tate", size, t.join(" ")) > andrew.width) {
                lines.push([...cur]);
                cur = [text];
            } else {
                cur.push(text);
            }
        });
        lines.push(cur);
        ctx.font = size + "px Tate";
        lines.forEach((line, i) => {
            var lineWidth = getTextWidth("Tate", size, line.join(" "));
            var co = 0;
            line.forEach((word) => {
                var isWhite = word.toUpperCase() == word;
                word.split("").forEach((char) => {
                    ctx.fillStyle = isWhite ? "white" : "orange";
                    ctx.textAlign = "left";
                    ctx.fillText(
                        char,
                        andrew.width / 2 - lineWidth / 2 + co,
                        andrew.height / 2 + (i + 0.75) * size,
                        getTextWidth("Tate", size, char)
                    );
                    co += getTextWidth("Tate", size, char);
                });
                co += getTextWidth("Tate", size, " ");
            });
        });
        resolve(c.toBuffer("image/png"));
    });
};
