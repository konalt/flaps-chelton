import {
    Canvas,
    CanvasRenderingContext2D,
    Image,
    createCanvas,
    loadImage,
} from "canvas";
import {
    customEmojiRegex,
    emojiRegex,
    flagEmojiRegex,
    twemojiURL,
} from "../utils";
import { downloadPromise } from "../download";

const customEmojiReplacement = "\uE001";
const flagEmojiReplacement = "\uE002";

function getLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = calculateDrawnLineWidth(
            currentLine + " " + word,
            ctx,
            lineHeight
        );
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

function downloadEmoji(emoji: string) {
    return new Promise<Image>((resolve, reject) => {
        downloadPromise(twemojiURL(emoji)).then(async (buffer) => {
            resolve(await loadImage(buffer));
        });
    });
}

function downloadCustomEmoji(emoji: string) {
    return new Promise<Image>((resolve, reject) => {
        let url =
            "https://cdn.discordapp.com/emojis/" +
            emoji.split(":")[2].split(">")[0] +
            ".png";
        downloadPromise(url).then(async (buffer) => {
            resolve(await loadImage(buffer));
        });
    });
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

function calculateDrawnLineWidth(
    line: string,
    ctx: CanvasRenderingContext2D,
    lineHeight: number
) {
    let width = 0;
    for (const char of line) {
        if (
            char.match(emojiRegex) ||
            char == flagEmojiReplacement ||
            char == customEmojiReplacement
        ) {
            width += lineHeight;
        } else {
            width += ctx.measureText(char).width;
        }
    }
    return width;
}

function getLinesForParagraphs(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
) {
    return text
        .split("\n")
        .map((para) => getLines(ctx, para, maxWidth, lineHeight))
        .reduce((a, b) => a.concat(b));
}

function drawLine(
    x: number,
    y: number,
    line: string,
    emojis: Record<string, Image>,
    customEmojis: Image[],
    flagEmojis: Image[],
    ctx: CanvasRenderingContext2D,
    lineHeight: number
) {
    let currentWidth = 0;
    let customEmojiIndex = 0;
    let flagEmojiIndex = 0;
    for (const char of line) {
        if (char.match(emojiRegex)) {
            ctx.drawImage(
                emojis[char],
                x + currentWidth,
                y,
                lineHeight,
                lineHeight
            );
            currentWidth += lineHeight;
        } else if (char == customEmojiReplacement) {
            let eh =
                lineHeight *
                (customEmojis[customEmojiIndex].height /
                    customEmojis[customEmojiIndex].width);
            let my = y + lineHeight / 2;
            ctx.drawImage(
                customEmojis[customEmojiIndex],
                x + currentWidth,
                my - eh / 2,
                lineHeight,
                eh
            );
            currentWidth += lineHeight;
            customEmojiIndex++;
        } else if (char == flagEmojiReplacement) {
            ctx.drawImage(
                flagEmojis[flagEmojiIndex],
                x + currentWidth,
                y,
                lineHeight,
                lineHeight
            );
            currentWidth += lineHeight;
            flagEmojiIndex++;
        } else {
            let cw = ctx.measureText(char).width;
            ctx.fillText(char, x + currentWidth, y);
            currentWidth += cw;
        }
    }
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
        let customEmojiList = text.match(customEmojiRegex) || [];
        let flagEmojiList = text.match(flagEmojiRegex) || [];
        text = text.replace(customEmojiRegex, customEmojiReplacement);
        text = text.replace(flagEmojiRegex, flagEmojiReplacement);
        let unicodeEmojis = [];
        for (const char of text) {
            if (char.match(emojiRegex) && !unicodeEmojis.includes(char)) {
                unicodeEmojis.push(char);
            }
        }
        let emojis: Record<string, Image> = {};
        let customEmojis: Image[] = [];
        let flagEmojis: Image[] = [];
        for (const emoji of unicodeEmojis) {
            emojis[emoji] = await downloadEmoji(emoji);
        }
        for (const emoji of customEmojiList) {
            customEmojis.push(await downloadCustomEmoji(emoji));
        }
        for (const emoji of flagEmojiList) {
            flagEmojis.push(await downloadEmoji(emoji));
        }

        let backgroundColor = options.background;
        let textColor = options.text;
        let fontSizeMultiplier = 0.1;
        let fontSize = Math.round(((width + height) / 2) * fontSizeMultiplier);
        ctx.font = fontSize + "px " + fontName;
        ctx.textBaseline = "top";
        let maxLineHeight = lineHeight(ctx);
        let yPadding = 0.4 * maxLineHeight;

        let lines = getLinesForParagraphs(
            ctx,
            text,
            width * 0.9,
            maxLineHeight
        );
        let totalHeight = maxLineHeight * lines.length;

        c.height = totalHeight + yPadding * 2;
        ctx.font = fontSize + "px " + fontName;
        ctx.textBaseline = "top";

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.textAlign = "left";
        ctx.fillStyle = textColor;
        let i = 0;
        for (const line of lines) {
            let lw = calculateDrawnLineWidth(line, ctx, maxLineHeight);
            drawLine(
                width / 2 - lw / 2,
                yPadding + i * maxLineHeight,
                line,
                emojis,
                customEmojis,
                flagEmojis,
                ctx,
                maxLineHeight
            );
            i++;
        }

        resolve([c.toBuffer("image/png"), c.height]);
    });
}
