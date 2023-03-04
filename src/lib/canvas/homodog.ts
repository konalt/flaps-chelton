import { uuidv4 } from "../utils";
import canvas, { CanvasRenderingContext2D } from "canvas";
import { loadImage } from "canvas";
import { createCanvas } from "canvas";

function todo(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number,
    fontSize: number,
    cx: number,
    cy: number
) {
    var max_width = w;
    var lines = new Array();
    var width = 0,
        i = 0,
        j = 0;
    var result: string;

    // Start calculation
    while (text.length) {
        for (
            i = text.length;
            ctx.measureText(text.substr(0, i)).width > max_width;
            i--
        );

        result = text.substr(0, i);

        if (i !== text.length)
            for (
                j = 0;
                result.indexOf(" ", j) !== -1;
                j = result.indexOf(" ", j) + 1
            );

        lines.push(result.substr(0, j || result.length));
        width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
        text = text.substr(lines[lines.length - 1].length, text.length);
    }

    var textH = cy;
    textH -= (lines.length * fontSize + (fontSize + 5)) / 2;
    textH += fontSize / 2;

    for (i = 0, j = lines.length; i < j; ++i) {
        ctx.fillText(lines[i], cx, textH + fontSize + (fontSize + 5) * i);
        ctx.strokeText(lines[i], cx, textH + fontSize + (fontSize + 5) * i);
    }
}

export default (buf: Buffer | null, text: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        let homodog = await loadImage(buf ?? "images/homophobicdog.png");
        var c = createCanvas(homodog.width, homodog.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(homodog, 0, 0, homodog.width, homodog.height);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "normal normal bolder " + homodog.height / 7 + "px Homodog";
        ctx.lineWidth = homodog.height / 240;
        todo(
            ctx as CanvasRenderingContext2D,
            text,
            homodog.width,
            homodog.height,
            homodog.height / 7,
            homodog.width / 2,
            homodog.height / 2
        );
        resolve(c.toBuffer("image/png"));
    });
};
