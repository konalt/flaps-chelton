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
const startAlternateFont = "\uE003";
const endAlternateFont = "\uE004";

function getLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number,
    fontSize: number
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
    let height =
        metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;
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
        width += currentLetterSpacing;
    }
    width -= currentLetterSpacing;
    return width;
}

function getLinesForParagraphs(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number,
    fontSize: number
) {
    return text
        .split("\n")
        .map((para) => getLines(ctx, para, maxWidth, lineHeight, fontSize))
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
    fontSize: number,
    debug: boolean
) {
    let currentWidth = 0;
    let customEmojiIndex = 0;
    let flagEmojiIndex = 0;
    for (const char of line) {
        if (char.match(emojiRegex)) {
            if (debug) {
                let ofs = "" + ctx.fillStyle;
                ctx.fillStyle = "aqua";
                ctx.fillRect(x + currentWidth, y, lineHeight, lineHeight);
                ctx.fillStyle = ofs;
            }
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
            if (debug) {
                let ofs = "" + ctx.fillStyle;
                ctx.fillStyle = "lime";
                ctx.fillRect(x + currentWidth, y, lineHeight, lineHeight);
                ctx.fillStyle = ofs;
            }
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
            if (debug) {
                let ofs = "" + ctx.fillStyle;
                ctx.fillStyle = "magenta";
                ctx.fillRect(x + currentWidth, y, lineHeight, lineHeight);
                ctx.fillStyle = ofs;
            }
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
            if (debug) {
                let oss = "" + ctx.strokeStyle;
                ctx.strokeStyle = "red";
                ctx.strokeRect(x + currentWidth, y, cw, lineHeight);
                ctx.strokeStyle = oss;
            }
            currentWidth += cw;
        }
        currentWidth += currentLetterSpacing;
    }
}

const defaultFont = "'Open Sans', sans-serif";
const width = 1200;
const height = 630;
const contentSize = 70;
const contentLetterSpacing = 2;
const contentWeight = 400;
const contentGap = 40;
const displayNameSize = 48;
const displayNameWeight = 400;
const displayNameGap = 20;
const usernameSize = 32;
const usernameWeight = 300;

let currentLetterSpacing = 0;

function fontString(size: number, italic: boolean, weight: number = 400) {
    return `${weight} ${italic ? "italic " : ""}${size}px ${defaultFont}`;
}

async function drawText(
    x: number,
    y: number,
    text: string,
    fontSize: number,
    fontWeight: number,
    italic: boolean,
    maxWidth: number,
    ctx: CanvasRenderingContext2D
) {
    ctx.textBaseline = "top";
    ctx.font = fontString(fontSize, italic, fontWeight);
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
    let maxLineHeight = lineHeight(ctx);
    let lines = getLinesForParagraphs(
        ctx,
        text,
        maxWidth,
        maxLineHeight,
        fontSize
    );
    let i = 0;
    for (const line of lines) {
        let lw = calculateDrawnLineWidth(line, ctx, maxLineHeight);
        drawLine(
            x - lw / 2,
            y + i * maxLineHeight,
            line,
            emojis,
            customEmojis,
            flagEmojis,
            ctx,
            maxLineHeight,
            fontSize,
            false
        );

        i++;
    }
}

function getTextHeight(
    text: string,
    fontSize: number,
    fontWeight: number,
    maxWidth: number,
    ctx: CanvasRenderingContext2D
) {
    ctx.font = fontString(fontSize, false, fontWeight);
    let maxLineHeight = lineHeight(ctx);
    let lines = getLinesForParagraphs(
        ctx,
        text,
        maxWidth,
        maxLineHeight,
        fontSize
    );
    let totalHeight = maxLineHeight * lines.length;
    return totalHeight;
}

function getQuoteBodyHeight(
    content: string,
    displayName: string,
    username: string,
    ctx: CanvasRenderingContext2D,
    stepValue: number
) {
    currentLetterSpacing = contentLetterSpacing;
    let contentHeight =
        getTextHeight(
            content,
            contentSize * stepValue,
            contentWeight,
            width - height,
            ctx
        ) + contentGap;
    currentLetterSpacing = 0;
    let displayNameHeight =
        getTextHeight(
            displayName,
            displayNameSize,
            displayNameWeight,
            width - height,
            ctx
        ) + displayNameGap;
    let usernameHeight = getTextHeight(
        username,
        usernameSize,
        usernameWeight,
        width - height,
        ctx
    );
    return [contentHeight, displayNameHeight, usernameHeight];
}

export default async function createQuote(
    content: string,
    displayName: string,
    username: string,
    avatar: Buffer
) {
    displayName = `- ${displayName}`;
    username = `@${username}`;
    let c = createCanvas(width, height);
    let ctx = c.getContext("2d");

    let avatarImage = await loadImage(avatar);
    ctx.drawImage(avatarImage, 0, 0, height, height);

    let gradient = ctx.createLinearGradient(0, 0, height * 0.8, 0);
    gradient.addColorStop(0, "rgba(0,0,0,0.1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    let stepValue = 1;
    let totalHeight = Infinity,
        contentHeight = Infinity,
        displayNameHeight = Infinity,
        usernameHeight = Infinity;
    while (stepValue > 0.1) {
        [contentHeight, displayNameHeight, usernameHeight] = getQuoteBodyHeight(
            content,
            displayName,
            username,
            ctx,
            stepValue
        );

        totalHeight = contentHeight + displayNameHeight + usernameHeight;
        if (totalHeight > height * 0.9) {
            stepValue -= 0.02;
        } else {
            break;
        }
    }
    ctx.fillStyle = "white";
    currentLetterSpacing = contentLetterSpacing;
    await drawText(
        height * 0.8 + (width - height * 0.8) / 2,
        (height - totalHeight) / 2,
        content,
        contentSize * stepValue,
        contentWeight,
        false,
        width - height,
        ctx
    );
    currentLetterSpacing = 0;
    await drawText(
        height * 0.8 + (width - height * 0.8) / 2,
        (height - totalHeight) / 2 + contentHeight,
        displayName,
        displayNameSize,
        displayNameWeight,
        true,
        width - height,
        ctx
    );
    ctx.fillStyle = "#ccc";
    await drawText(
        height * 0.8 + (width - height * 0.8) / 2,
        (height - totalHeight) / 2 + contentHeight + displayNameHeight,
        username,
        usernameSize,
        usernameWeight,
        false,
        width - height,
        ctx
    );

    return c.toBuffer();
}
