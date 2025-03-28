import { createCanvas, loadImage } from "canvas";
import minimum from "../ffmpeg/minimum";
import { sample } from "../utils";
import { drawText, getTextHeight } from "./drawText";

const CheckLevels = [
    ["Trivial", 6],
    ["Easy", 8],
    ["Medium", 10],
    ["Challenging", 12],
    ["Formidable", 13],
    ["Legendary", 14],
    ["Godly", 15],
    ["Heroic", 16],
    ["Impossible", 20],
];

export default async function elysium(img: Buffer, text: string) {
    let newImage = await minimum([[img, "png"]], 512);
    const image = await loadImage(newImage);
    const c = createCanvas(image.width, image.height);
    const ctx = c.getContext("2d");
    let checkType = text.split("*")[1];
    let checkDialogue = text.split("*").slice(2).join("*").trimStart();
    if (!text.match(/^\\?\*.+\\?\* ?.+/)) {
        checkType = "Rizz Gyatt";
        checkDialogue = text;
    }
    let skill = sample(CheckLevels);
    let checkText = `1. - [${checkType} - ${skill[0]} ${skill[1]}] "${checkDialogue}"\n2. - "Nothing" [Leave.]`;
    let average = (image.height + image.width) / 2;
    ctx.font = `${average * 0.06}px serif`;
    let textHeight = getTextHeight(ctx, checkText, image.width * 0.8);
    c.height = image.height * 0.75 + textHeight;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    let gradient = ctx.createLinearGradient(
        0,
        image.height * 0.5,
        0,
        image.height * 0.95
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "black");
    ctx.font = `${average * 0.06}px serif`;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, image.width, c.height);
    ctx.fillStyle = "#ce6348";
    await drawText(
        ctx,
        checkText,
        image.width * 0.05,
        image.height * 0.75,
        image.width * 0.9,
        false,
        "top"
    );
    return c.toBuffer();
}
