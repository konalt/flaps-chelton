import { loadImage, createCanvas } from "canvas";
import getTextWidth from "./getTextWidth";

export default async function andrewtate(buf: Buffer, txt: string) {
    let andrew = await loadImage("images/tate.jpg");
    let image = await loadImage(buf);
    let c = createCanvas(andrew.width, andrew.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(andrew, 0, 0, andrew.width, andrew.height);
    ctx.drawImage(image, 0, andrew.height / 2, andrew.width, andrew.height / 2);
    let fac = 0;
    let grad = ctx.createLinearGradient(
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
    let textArr = txt.split(" ");
    let size = andrew.height / 8;
    let cur: string[] = [];
    let lines: string[][] = [];
    textArr.forEach((text) => {
        let t: string[] = [...cur];
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
        let lineWidth = getTextWidth("Tate", size, line.join(" "));
        let co = 0;
        line.forEach((word) => {
            let isWhite = word.toUpperCase() == word;
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
    return c.toBuffer();
}
