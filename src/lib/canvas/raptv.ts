import { loadImage, createCanvas } from "canvas";
import getTextWidth from "./getTextWidth";
import { file } from "../ffmpeg/ffmpeg";

function fixSize(
    imgWidth: number,
    imgHeight: number,
    targetWidth: number,
    targetHeight: number
) {
    if (imgWidth > imgHeight) {
        let ratio = targetHeight / imgHeight;
        return [imgWidth * ratio, imgHeight * ratio];
    } else {
        let ratio = targetWidth / imgWidth;
        return [imgWidth * ratio, imgHeight * ratio];
    }
}

export default (buf: Buffer, text: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let image = await loadImage(buf);
        let logo = await loadImage("images/raptv.png");
        let [w, h] = [700, 512];
        let bottomPadding = 120;
        var c = createCanvas(w, h + bottomPadding);
        var ctx = c.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, h + bottomPadding);
        let imgsize = fixSize(image.width, image.height, w, h);
        ctx.drawImage(
            image,
            w / 2 - imgsize[0] / 2,
            h / 2 - imgsize[1] / 2,
            imgsize[0],
            imgsize[1]
        );
        let vignette = ctx.createRadialGradient(
            w / 2,
            h / 2,
            100,
            w / 2,
            h / 2,
            w / 2
        );
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h + bottomPadding);
        let gradient = ctx.createLinearGradient(0, h * 0.6, 0, h);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h + bottomPadding);
        var textArr = text.split(" ");
        var size = h / 7;
        var cur: string[] = [];
        var lines: string[][] = [];
        textArr.forEach((text) => {
            var t: string[] = [...cur];
            t.push(text);
            if (getTextWidth("Tate", size, t.join(" ")) > w - 40) {
                lines.push([...cur]);
                cur = [text];
            } else {
                cur.push(text);
            }
        });
        lines.push(cur);
        ctx.font = size + "px Tate";
        lines.reverse();
        lines.forEach((line, i) => {
            var lineWidth = getTextWidth("Tate", size, line.join(" "));
            var co = 0;
            line.forEach((word) => {
                var isOrange = word.toUpperCase() == word;
                word.split("").forEach((char) => {
                    ctx.fillStyle = isOrange ? "orange" : "#ccc";
                    ctx.textAlign = "left";
                    ctx.fillText(
                        char,
                        w / 2 - lineWidth / 2 + co,
                        h + bottomPadding - i * size - 50,
                        getTextWidth("Tate", size, char)
                    );
                    co += getTextWidth("Tate", size, char);
                });
                co += getTextWidth("Tate", size, " ");
            });
        });
        let gapSize = w / 5;
        let lineY = h + bottomPadding - 25;
        ctx.beginPath();
        ctx.moveTo(20, lineY);
        ctx.lineTo(w / 2 - gapSize / 2, lineY);
        ctx.moveTo(w / 2 + gapSize / 2, lineY);
        ctx.lineTo(w - 20, lineY);
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.stroke();
        let [lw, lh] = fixSize(logo.width, logo.height, 100, 40);
        ctx.drawImage(logo, w / 2 - lw / 2, lineY - lh / 2, lw, lh);
        resolve(c.toBuffer("image/png"));
    });
};
