import { CanvasRenderingContext2D, createCanvas, loadImage } from "canvas";
import { drawText, getTextHeight } from "./drawText";

const defaultFont = "'Open Sans', sans-serif";
const width = 1200;
const height = 630;
const contentSize = 70;
const contentWeight = 400;
const contentGap = 40;
const displayNameSize = 48;
const displayNameWeight = 400;
const displayNameGap = 20;
const usernameSize = 32;
const usernameWeight = 300;

function fontString(size: number, italic: boolean, weight: number = 400) {
    return `${weight} ${italic ? "italic " : ""}${size}px ${defaultFont}`;
}

function getQuoteBodyHeight(
    content: string,
    displayName: string,
    username: string,
    ctx: CanvasRenderingContext2D,
    stepValue: number
) {
    ctx.font = fontString(contentSize * stepValue, false, contentWeight);
    let contentHeight =
        getTextHeight(ctx, content, width - height) + contentGap;
    ctx.font = fontString(displayNameSize, false, displayNameWeight);
    let displayNameHeight =
        getTextHeight(ctx, displayName, width - height) + displayNameGap;
    ctx.font = fontString(usernameSize, false, usernameWeight);
    let usernameHeight = getTextHeight(ctx, username, width - height);
    return [contentHeight, displayNameHeight, usernameHeight];
}

export default async function createQuote(
    content: string,
    displayName: string,
    username: string,
    avatar: Buffer,
    nameColor = "white"
) {
    displayName = `- ${displayName}`;
    username = `${username}`;
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
    ctx.textAlign = "center";
    ctx.font = fontString(contentSize * stepValue, false, contentWeight);
    await drawText(
        ctx,
        content,
        height * 0.8 + (width - height * 0.8) / 2,
        (height - totalHeight) / 2,
        width - height
    );
    ctx.fillStyle = nameColor;
    ctx.font = fontString(displayNameSize, true, displayNameWeight);
    await drawText(
        ctx,
        displayName,
        height * 0.8 + (width - height * 0.8) / 2,
        (height - totalHeight) / 2 + contentHeight,
        width - height
    );
    ctx.fillStyle = "#ccc";
    ctx.font = fontString(usernameSize, false, usernameWeight);
    await drawText(
        ctx,
        username,
        height * 0.8 + (width - height * 0.8) / 2,
        (height - totalHeight) / 2 + contentHeight + displayNameHeight,
        width - height
    );

    return c.toBuffer();
}
