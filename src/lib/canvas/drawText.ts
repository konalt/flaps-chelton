import {
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

export function lineHeight(ctx: CanvasRenderingContext2D) {
    let baseline: CanvasTextBaseline = `${ctx.textBaseline}`;
    ctx.textBaseline = "top";
    let metrics = ctx.measureText(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    );
    let height = metrics.actualBoundingBoxDescent;
    ctx.textBaseline = baseline;
    return height;
}

async function downloadEmoji(emoji: string) {
    let buffer = await downloadPromise(twemojiURL(emoji));
    return await loadImage(buffer);
}

async function downloadCustomEmoji(emoji: string) {
    let url =
        "https://cdn.discordapp.com/emojis/" +
        emoji.split(":")[2].split(">")[0] +
        ".png";
    let buffer = await downloadPromise(url);
    return await loadImage(buffer);
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
    lineHeight: number,
    stroke: boolean
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
            if (char == " ") {
                currentWidth += ctx.measureText(" ").width;
            } else {
                let cw = ctx.measureText(char).width;
                ctx.fillText(char, x + currentWidth, y);
                if (stroke) {
                    ctx.strokeText(char, x + currentWidth, y);
                }
                currentWidth += cw;
            }
        }
    }
}

function escapeText(text: string) {
    return text
        .replace(customEmojiRegex, customEmojiReplacement)
        .replace(flagEmojiRegex, flagEmojiReplacement);
}

export async function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    wrapWidth: number,
    stroke = false
) {
    // store current alignment for later
    let align: CanvasTextAlign = `${ctx.textAlign}`;
    let baseline: CanvasTextBaseline = `${ctx.textBaseline}`;

    // create lists of all custom/flag emojis and replace them in the text with special characters
    let customEmojiList = text.match(customEmojiRegex) || [];
    let flagEmojiList = text.match(flagEmojiRegex) || [];
    text = escapeText(text);

    // create list of unicode emojis to fetch from twemoji
    let unicodeEmojis = [];
    for (const char of text) {
        if (char.match(emojiRegex) && !unicodeEmojis.includes(char)) {
            unicodeEmojis.push(char);
        }
    }

    // download all emojis
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

    ctx.textBaseline = "top";
    let maxLineHeight = lineHeight(ctx);
    let lines = getLinesForParagraphs(ctx, text, wrapWidth, maxLineHeight);

    ctx.textAlign = "left";
    let i = 0;
    for (const line of lines) {
        let lineWidth = calculateDrawnLineWidth(line, ctx, maxLineHeight);
        let lineX = x;
        switch (align) {
            case "center":
                lineX = x - lineWidth / 2;
                break;
            case "right":
                lineX = x - lineWidth;
                break;
        }
        drawLine(
            lineX,
            y + i * maxLineHeight,
            line,
            emojis,
            customEmojis,
            flagEmojis,
            ctx,
            maxLineHeight,
            stroke
        );
        i++;
    }
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
}

export function getTextHeight(
    ctx: CanvasRenderingContext2D,
    text: string,
    wrapWidth: number
) {
    let maxLineHeight = lineHeight(ctx);
    let lines = getLinesForParagraphs(
        ctx,
        escapeText(text),
        wrapWidth,
        maxLineHeight
    );

    return maxLineHeight * lines.length;
}
