import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import { emojiRegex } from "../utils";

function getLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function lineHeight(ctx: CanvasRenderingContext2D) {
    let metrics = ctx.measureText(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
    let height = metrics.actualBoundingBoxDescent;
    return height;
}

function decodeOptions(text: string) {
    let textArr = text.split(" ");
    let options = {
        background: "#ffffff",
        text: "#000000",
    };
    for (const word of textArr) {
        if (!word.startsWith("--")) continue;
        let [option, value] = word.substring(2).split("=");
        if (Object.keys(options).includes(option)) {
            options[option] = value;
        }
    }
    return options;
}

export default function createCaption2(
    width: number,
    height: number,
    text: string
): Promise<[Buffer, number]> {
    return new Promise(async (resolve, reject) => {
        let c = createCanvas(width, width);
        let ctx = c.getContext("2d");
        let fontName = '"Futura Condensed Extra", sans-serif';
        let options = decodeOptions(text);
        text = text
            .split(" ")
            .filter((w) => !w.startsWith("--"))
            .join(" ");
        let emojis = text.match(emojiRegex);
        console.log(emojis);
        let backgroundColor = options.background;
        let textColor = options.text;
        let fontSizeMultiplier = 0.1;
        let fontSize = Math.round(((width + height) / 2) * fontSizeMultiplier);
        ctx.font = fontSize + "px " + fontName;
        ctx.textBaseline = "top";
        let maxLineHeight = lineHeight(ctx);
        let yPadding = 0.5 * maxLineHeight;

        let lines = getLines(ctx, text, width);
        let totalHeight = maxLineHeight * lines.length;

        c.height = totalHeight + yPadding * 2;
        ctx.font = fontSize + "px " + fontName;
        ctx.textBaseline = "top";

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.textAlign = "center";
        ctx.fillStyle = textColor;
        let i = 0;
        for (const line of lines) {
            ctx.fillText(line, width / 2, yPadding + i * maxLineHeight);
            i++;
        }

        resolve([c.toBuffer("image/png"), c.height]);
    });
}
