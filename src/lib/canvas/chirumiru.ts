import {
    Image,
    createCanvas,
    loadImage,
    CanvasRenderingContext2D,
} from "canvas";
import { addBufferSequence, removeBuffer } from "../..";
import { ffmpegBuffer, file } from "../ffmpeg/ffmpeg";
import { distance, getAngle } from "../utils";

const RESOLUTION = 0.5;
const [w, h] = [1280, 720];

//#region drawing funcs
function drawChirumiruTitleText(
    characterName: string,
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D
) {
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "900 300px 'Arial Black'";
    ctx.textBaseline = "alphabetic";
    let cirnoWidth = measureTextAdvanced("CIRNO", -28, ctx);
    let chirumiruTextHeight = drawTextAdvanced(
        characterName,
        x,
        y,
        true,
        -28,
        cirnoWidth,
        ctx
    );

    drawTextAdvanced(
        "CHIRUMIRU",
        x,
        y - chirumiruTextHeight,
        true,
        -28,
        -1,
        ctx
    );
    ctx.font = "900 150px 'Arial Black'";
    let cirnoWidth2 = measureTextAdvanced("CIRNO", -14, ctx);
    chirumiruTextHeight = drawTextAdvanced(
        characterName,
        x - cirnoWidth,
        y,
        true,
        -14,
        cirnoWidth2,
        ctx
    );
    drawTextAdvanced(
        "CHIRUMIRU",
        x - cirnoWidth,
        y - chirumiruTextHeight,
        true,
        -14,
        -1,
        ctx
    );
}

function drawTextAdvanced(
    text: string,
    x: number,
    y: number,
    isRightAligned: boolean = false,
    letterSpacingBias: number = 0,
    forceWidth: number = -1,
    ctx: CanvasRenderingContext2D,
    stroke: boolean = false
) {
    let w = 0;
    if (isRightAligned) {
        text = text.split("").reverse().join("");
    }
    if (forceWidth > 0) {
        let actualTextWidth = measureTextAdvanced(text, letterSpacingBias, ctx);
        let factor = forceWidth / actualTextWidth;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(factor, 1);
        ctx.translate(-x, -y);
    }
    for (const char of text) {
        let size = ctx.measureText(char).width;
        ctx.fillText(
            char,
            x +
                w * (isRightAligned ? -1 : 1) +
                letterSpacingBias * (isRightAligned ? -1 : 1),
            y
        );
        if (stroke) {
            ctx.strokeText(
                char,
                x +
                    w * (isRightAligned ? -1 : 1) +
                    letterSpacingBias * (isRightAligned ? -1 : 1),
                y
            );
        }
        w += size + letterSpacingBias;
    }
    if (forceWidth > 0) {
        ctx.restore();
    }
    return ctx.measureText(text).actualBoundingBoxAscent;
}

function measureTextAdvanced(
    text: string,
    letterSpacingBias: number = 0,
    ctx: CanvasRenderingContext2D
) {
    let w = 0;
    for (const char of text) {
        w += ctx.measureText(char).width + letterSpacingBias;
    }
    return w;
}

async function drawImageAt(
    image: Image,
    x: number,
    y: number,
    w: number,
    h: number,
    scale = 1,
    rotation = 0,
    ctx: CanvasRenderingContext2D
) {
    let aw = w * scale;
    let ah = h * scale;
    let ax = x - aw / 2;
    let ay = y - ah / 2;

    if (rotation !== 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * (Math.PI / 180));
        ctx.translate(-x, -y);
    }
    ctx.drawImage(image, ax, ay, aw, ah);
    if (rotation !== 0) {
        ctx.restore();
    }
}

async function drawBackgroundArrow(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    thickness: number,
    pointerFactor: number = 0.2,
    ctx: CanvasRenderingContext2D
) {
    let angle = getAngle(endX, endY, startX, startY);
    let length = distance(startX, startY, endX, endY);
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -thickness * 0.6);
    ctx.lineTo(length * (1 - pointerFactor * 2), -thickness * 0.4);
    ctx.lineTo(length * (1 - pointerFactor * 2), -length * pointerFactor);
    ctx.lineTo(length, 0);
    ctx.lineTo(length * (1 - pointerFactor * 2), length * pointerFactor);
    ctx.lineTo(length * (1 - pointerFactor * 2), thickness * 0.4);
    ctx.lineTo(0, thickness * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawNineball(
    x: number,
    y: number,
    radius: number,
    ctx: CanvasRenderingContext2D
) {
    ctx.lineWidth = radius * 0.1;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.font = radius * 1.9 + "px 'Spotify'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("9", x, y, radius * 2);
}

function drawSpeechBubble(
    x: number,
    y: number,
    w: number,
    h: number,
    ctx: CanvasRenderingContext2D
) {
    const rad = w * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.arc(x + w - rad, y + rad, rad, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + w, y + h - rad);
    ctx.arc(x + w - rad, y + h - rad, rad, 0, Math.PI * 0.5);
    ctx.lineTo(x + rad * 3, y + h);
    ctx.lineTo(x + rad, y + h + rad);
    ctx.lineTo(x + rad * 1.5, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.arc(x + rad, y + h - rad, rad, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + rad);
    ctx.arc(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawSpeechBubble2(
    x: number,
    y: number,
    w: number,
    h: number,
    ctx: CanvasRenderingContext2D
) {
    const rad = w * 0.1;
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.arc(x + w - rad, y + rad, rad, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + w, y + h - rad);
    ctx.arc(x + w - rad, y + h - rad, rad, 0, Math.PI * 0.5);
    ctx.lineTo(x + w / 2 + rad / 2, y + h);
    ctx.lineTo(x + w / 2, y + h + (rad / 2) * 1.5);
    ctx.lineTo(x + w / 2 - rad / 2, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.arc(x + rad, y + h - rad, rad, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + rad);
    ctx.arc(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
//#endregion

async function TAS1(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let textAndCharacterScene1 = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(characterName, w + offset, h, ctx);
        drawImageAt(image, 120 - offset, -40, (w / 5) * 4, h * 2, 1, 0, ctx);
        return c.toBuffer();
    };

    frames.push([textAndCharacterScene1(0), 1]);
    frames.push([textAndCharacterScene1(6), 1]);
    frames.push([textAndCharacterScene1(10), 1]);
    frames.push([textAndCharacterScene1(13), 2]);
    frames.push([textAndCharacterScene1(16), 2]);
    frames.push([textAndCharacterScene1(17), 3]);
    return frames;
}

async function TAS2(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let textAndCharacterScene2 = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(
            characterName,
            (w / 2) * 3 - offset,
            (h / 3) * 2,
            ctx
        );
        drawImageAt(
            image,
            w - 100 + offset,
            h / 3,
            (w / 5) * 4,
            h * 2,
            1,
            0,
            ctx
        );
        return c.toBuffer();
    };

    frames.push([textAndCharacterScene2(0), 1]);
    frames.push([textAndCharacterScene2(6), 1]);
    frames.push([textAndCharacterScene2(10), 1]);
    frames.push([textAndCharacterScene2(13), 2]);
    frames.push([textAndCharacterScene2(16), 2]);
    frames.push([textAndCharacterScene2(17), 3]);
    return frames;
}

async function TAS3(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let textAndCharacterScene3 = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(characterName, w * 1.2, h - offset, ctx);
        drawImageAt(
            image,
            -350,
            -550 + offset,
            (w / 5) * 4,
            h * 2,
            1.5,
            0,
            ctx
        );
        return c.toBuffer();
    };

    frames.push([textAndCharacterScene3(0), 1]);
    frames.push([textAndCharacterScene3(10), 1]);
    frames.push([textAndCharacterScene3(13), 1]);
    frames.push([textAndCharacterScene3(16), 1]);
    frames.push([textAndCharacterScene3(17), 1]);
    return frames;
}

async function TAS4(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let textAndCharacterScene4 = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(
            characterName,
            w * 0.8 - offset,
            (h / 3) * 2,
            ctx
        );
        drawImageAt(
            image,
            w * 1.2 + offset,
            h / 2,
            (w / 5) * 4,
            h * 2,
            1.5,
            0,
            ctx
        );
        return c.toBuffer();
    };

    frames.push([textAndCharacterScene4(0), 1]);
    frames.push([textAndCharacterScene4(10), 1]);
    frames.push([textAndCharacterScene4(13), 1]);
    frames.push([textAndCharacterScene4(16), 1]);
    frames.push([textAndCharacterScene4(17), 1]);
    return frames;
}

async function TAS5(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let textAndCharacterScene5 = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(characterName, w, 500 + offset, ctx);
        drawImageAt(image, 200, 900 - offset, (w / 5) * 4, h * 2, 1.5, 0, ctx);
        return c.toBuffer();
    };

    frames.push([textAndCharacterScene5(0), 1]);
    frames.push([textAndCharacterScene5(10), 1]);
    frames.push([textAndCharacterScene5(13), 1]);
    frames.push([textAndCharacterScene5(16), 1]);
    frames.push([textAndCharacterScene5(17), 1]);
    return frames;
}

async function TAS6(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let textAndCharacterScene6 = (offset: number) => {
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(
            characterName,
            w * 1.1,
            (h / 4) * 3 - offset,
            ctx
        );
        drawImageAt(
            image,
            w / 2,
            h / 2,
            (w / 5) * 4,
            h * 2,
            1 + (-offset / 17) * 0.3,
            0,
            ctx
        );
        return c.toBuffer();
    };

    frames.push([textAndCharacterScene6(0), 1]);
    frames.push([textAndCharacterScene6(6), 1]);
    frames.push([textAndCharacterScene6(10), 1]);
    frames.push([textAndCharacterScene6(13), 1]);
    frames.push([textAndCharacterScene6(16), 2]);
    frames.push([textAndCharacterScene6(17), 3]);
    return frames;
}

async function GENKI(image: Image) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let nomuYoGenki = (zoom: number) => {
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w * 0.55, h * 0.65);
        ctx.scale(zoom, zoom);
        ctx.translate(-w * 0.55, -h * 0.65);
        ctx.fillStyle = "white";
        let minAngle = 3.28;
        let maxAngle = 6.38;
        let range = maxAngle - minAngle;
        let innerRadius = 300;
        let outerRadius = 1000;
        for (let i = 0; i < 9; i++) {
            let theta = (i / 8) * range + minAngle;
            drawBackgroundArrow(
                w * 0.6 + Math.cos(theta) * outerRadius,
                h * 0.7 + Math.sin(theta) * outerRadius,
                w * 0.6 + Math.cos(theta) * innerRadius,
                h * 0.7 + Math.sin(theta) * innerRadius,
                75,
                0.1,
                ctx
            );
        }
        drawImageAt(image, w * 0.55, h * 0.6, w * 0.3, w * 0.4, 1, -5, ctx);
        ctx.restore();
        return c.toBuffer();
    };

    frames.push([nomuYoGenki(4), 1]);
    frames.push([nomuYoGenki(3.5), 1]);
    frames.push([nomuYoGenki(3), 1]);
    frames.push([nomuYoGenki(2.5), 1]);
    frames.push([nomuYoGenki(2.25), 1]);
    frames.push([nomuYoGenki(2), 1]);
    frames.push([nomuYoGenki(1.875), 1]);
    frames.push([nomuYoGenki(1.75), 1]);
    frames.push([nomuYoGenki(1.625), 1]);
    frames.push([nomuYoGenki(1.5), 1]);
    frames.push([nomuYoGenki(1.375), 1]);
    frames.push([nomuYoGenki(1.25), 1]);
    frames.push([nomuYoGenki(1.125), 1]);
    frames.push([nomuYoGenki(1.075), 1]);
    frames.push([nomuYoGenki(1.0375), 1]);
    frames.push([nomuYoGenki(1), 1]);
    return frames;
}

async function GENKI2(image: Image) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let nomuYoGenki2 = (zoom: number, radius: number) => {
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "white";
        let beamCount = 14;
        for (let i = 0; i < beamCount; i += 1) {
            ctx.beginPath();
            ctx.moveTo(w * 0.55, h * 0.6);
            ctx.arc(
                w * 0.55,
                h * 0.6,
                radius,
                (i / beamCount) * (Math.PI * 2),
                ((i + 0.5) / beamCount) * (Math.PI * 2)
            );
            ctx.closePath();
            ctx.fill();
        }
        ctx.save();
        ctx.translate(w * 0.55, h * 0.65);
        ctx.scale(zoom, zoom);
        ctx.translate(-w * 0.55, -h * 0.65);
        drawImageAt(image, w * 0.55, h * 0.6, w * 0.3, w * 0.4, 1, -5, ctx);
        ctx.restore();
        return c.toBuffer();
    };

    let z = 1;
    let r = 0;
    frames.push([nomuYoGenki2((z += 0.15), (r += 80)), 1]);
    frames.push([nomuYoGenki2((z += 0.05), (r += 80)), 1]);
    for (let i = 0; i < 18; i++) {
        frames.push([nomuYoGenki2((z += 0.025), (r += 80)), 1]);
    }
    return frames;
}

async function MILK1(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let frame = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(characterName, w + offset, h, ctx);
        drawImageAt(image, 130 - offset, h / 2, h * 1.4, h * 2, 1, 0, ctx);
        return c.toBuffer();
    };

    frames.push([frame(0), 1]);
    frames.push([frame(6), 1]);
    frames.push([frame(10), 1]);
    frames.push([frame(13), 2]);
    frames.push([frame(16), 3]);
    frames.push([frame(17), 3]);
    return frames;
}

async function MILK2(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let frame = (offset: number) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        drawChirumiruTitleText(characterName, w, 300 + offset, ctx);
        drawImageAt(image, w / 2, h * 1.5 - offset, h * 1.4, h * 2, 1, 0, ctx);
        return c.toBuffer();
    };

    frames.push([frame(0), 1]);
    frames.push([frame(6), 1]);
    frames.push([frame(10), 1]);
    frames.push([frame(13), 2]);
    frames.push([frame(16), 2]);
    frames.push([frame(17), 3]);
    return frames;
}

async function MILK3(image: Image, characterName: string) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let frame = (offset: number, canMult: number = 1) => {
        offset *= 1.5;
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(1 + (offset / 17) * 0.3, 1 + (offset / 17) * 0.3);
        ctx.translate(-w / 2, -h / 2);
        drawChirumiruTitleText(characterName, w * 1.3, h / 2 + 300, ctx);
        ctx.restore();
        drawImageAt(
            image,
            w / 2,
            h / 2,
            h * 1.4,
            h * 2,
            (1 - (offset / 17) * 0.3) * canMult,
            0,
            ctx
        );
        return c.toBuffer();
    };

    frames.push([frame(0), 1]);
    frames.push([frame(3), 1]);
    frames.push([frame(6), 1]);
    frames.push([frame(9), 1]);
    frames.push([frame(10), 1]);
    frames.push([frame(11), 1]);
    frames.push([frame(12), 2]);
    frames.push([frame(13), 2]);
    frames.push([frame(14), 2]);
    frames.push([frame(15), 2]);
    frames.push([frame(16), 3]);
    frames.push([frame(17), 3]);
    frames.push([frame(17, 1.1), 1]);
    frames.push([frame(17, 1.5), 1]);
    frames.push([frame(17, 2.1), 1]);
    frames.push([frame(17, 4.0), 1]);
    return frames;
}

async function KONA(characterImage: Image) {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let ao = 0;
    let beamCount = 8;
    let frame = (
        txsc: number,
        fgAlpha: number = 1,
        frameIndex: number,
        cirnoPopup: number,
        popupChars: number,
        flashOpacity: number = 0
    ) => {
        ctx.fillStyle = GRADIENTS.BG;
        if (fgAlpha < 1) {
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 4; i++) {
                drawImageAt(
                    NineballLine,
                    (frameIndex % 22) * 10 * ((i % 2 == 0 ? 1 : 0) * 2 - 1) +
                        w / 2,
                    (i + 0.5) * (h / 4) - 10,
                    2200,
                    200,
                    1,
                    0,
                    ctx
                );
            }
            ctx.globalAlpha = fgAlpha;
        }
        if (fgAlpha > 0) {
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "white";
            for (let i = 0; i < beamCount; i += 1) {
                ctx.beginPath();
                ctx.moveTo(w / 2, h / 2);
                ctx.arc(
                    w / 2,
                    h / 2,
                    w,
                    (i / beamCount) * (Math.PI * 2) + ao,
                    ((i + 0.5) / beamCount) * (Math.PI * 2) + ao
                );
                ctx.closePath();
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 100, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.scale(txsc, txsc);
            ctx.translate(-w / 2, -h / 2);
            ctx.font = "900 60px 'Spotify'";
            ctx.fillStyle = "#1a3980";
            ctx.strokeStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.lineJoin = "round";
            ctx.lineWidth = 8;
            ctx.strokeText("Presented by", w / 2, h / 3);
            ctx.fillText("Presented by", w / 2, h / 3);
            ctx.font = "900 300px 'Spotify'";
            ctx.textAlign = "left";
            let tw = measureTextAdvanced("Chelton", -28, ctx);
            drawTextAdvanced(
                "Chelton",
                w / 2 - tw / 2,
                500,
                false,
                -28,
                tw,
                ctx,
                true
            );
            ctx.restore();
            ao += 0.1;
        }
        if (fgAlpha < 1) {
            ctx.globalAlpha = 1;
        }
        if (fgAlpha == 0) {
            if (cirnoPopup <= 1) {
                ctx.drawImage(
                    characterImage,
                    -20,
                    h - cirnoPopup * h * 0.9,
                    w * 0.45,
                    h * 0.95
                );
                if (cirnoPopup > 0.5) {
                    let bh = (cirnoPopup - 0.5) * 2 * 400;
                    ctx.fillStyle = "white";
                    ctx.strokeStyle = "#777";
                    ctx.lineWidth = 14;
                    ctx.lineJoin = "round";
                    drawSpeechBubble(
                        540,
                        h / 2 - bh * 1.2 + 30,
                        bh * 1.5,
                        bh * 1.1,
                        ctx
                    );
                    if (cirnoPopup == 1) {
                        let lines = [
                            "I know.****** It's a product*",
                            "from Flaps Chelton*",
                            "Industries or Touhou,*",
                            "right?***********",
                        ];
                        let lines2 = [
                            "W*h*a*t*?******* I*t* *i*s*n*'*t*?*******",
                            "I didn't know that~********",
                        ];
                        let draw = [];
                        let nPopupChars = popupChars;
                        if (popupChars > lines.join("").length) {
                            draw = lines2;
                            nPopupChars = popupChars - lines.join("").length;
                        } else {
                            draw = lines;
                        }
                        ctx.font = "50px 'Spotify'";
                        ctx.fillStyle = "black";
                        let i = 0;
                        let li = 0;
                        for (const line of draw) {
                            let lw = measureTextAdvanced(
                                line.replace(/\*/g, ""),
                                0,
                                ctx
                            );
                            let lc = nPopupChars - i;
                            let tx = "";
                            if (lc >= line.length) {
                                tx = line;
                                i += line.length;
                            } else {
                                tx = line.substring(0, lc);
                                i += lc;
                            }
                            drawTextAdvanced(
                                tx.replace(/\*/g, ""),
                                540 + (bh * 1.5) / 2 - lw / 2,
                                80 + li * 70,
                                false,
                                0,
                                -1,
                                ctx,
                                false
                            );
                            li++;
                        }
                    }
                }
            } else {
                ctx.save();
                ctx.translate(w / 2, (h / 3) * 2);
                let sc = 1 + ((cirnoPopup - 1) / 2) * 0.02;
                ctx.scale(sc, sc);
                ctx.translate(-w / 2, (-h / 3) * 2);
                ctx.drawImage(
                    characterImage,
                    -20 +
                        ((Math.min(cirnoPopup, 2) - 1) / 1) *
                            (w / 2 - (w * 0.45) / 2 + 20),
                    h * 0.1 + ((Math.min(cirnoPopup, 2) - 1) / 1) * 150,
                    w * 0.45,
                    h * 0.95
                );
                if (cirnoPopup >= 2) {
                    ctx.fillStyle = "white";
                    ctx.strokeStyle = "#777";
                    ctx.lineWidth = 14;
                    ctx.lineJoin = "round";
                    drawSpeechBubble2(w / 2 - 800 / 2, -250, 800, 500, ctx);
                    ctx.fillStyle = "black";
                    ctx.font = "100px Fancy";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("Then what is it~??", w / 2, 125, 750);
                }
                ctx.restore();
            }
        }
        if (flashOpacity > 0) {
            ctx.fillStyle = `rgba(255,255,255,${flashOpacity})`;
            ctx.fillRect(0, 0, w, h);
        }
        return c.toBuffer();
    };
    for (let i = 0; i < 6; i++) {
        frames.push([frame(1 + ((5 - i) / 5) * 2, 1, frames.length, 0, 0), 1]);
    }
    while (frames.length < 61) {
        frames.push([frame(1, 1, frames.length, 0, 0), 1]);
    }
    for (let i = 0; i < 14; i++) {
        frames.push([frame(1, (14 - i) / 14, frames.length - 67, 0, 0), 1]);
    }
    let ch = -6;
    while (frames.length < 279) {
        frames.push([
            frame(
                1,
                0,
                frames.length - 67,
                Math.min(1, (frames.length - 75) / 9),
                Math.floor(Math.max((ch += 0.8), 0))
            ),
            1,
        ]);
    }
    let flashes = [0.1, 0.1, 0.25, 0.6, 0.4, 1, 0.6, 1, 0.6, 1, 0.6, 1];
    while (frames.length < 352 - flashes.length) {
        frames.push([
            frame(
                1,
                0,
                frames.length - 67,
                (frames.length - 274) / 5,
                Math.floor(Math.max((ch += 0.8), 0))
            ),
            1,
        ]);
    }
    let fi = 0;
    while (frames.length < 352) {
        frames.push([
            frame(
                1,
                0,
                frames.length - 67,
                (frames.length - 274) / 5,
                Math.floor(Math.max((ch += 0.8), 0)),
                flashes[fi]
            ),
            1,
        ]);
        fi++;
    }
    return frames;
}

async function INTROCRED() {
    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);
    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");
    let frames = [];
    let frame = (frame: number) => {
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        let a = 0;
        while (a < Math.PI * 2) {
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2);
            let seg = Math.random() * 0.1;
            ctx.arc(w / 2, h / 2, w, a, Math.min(a + seg, Math.PI * 2));
            a += seg;
            a += Math.random() * 0.1 + 0.1;
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        let count = 75;
        let rad = 275 + (Math.max(6 - frame, 0) / 6) * 250;
        for (let i = 0; i < count; i++) {
            let a = (i / count) * Math.PI * 2 + frame * 0.05;
            let x = Math.cos(a) * rad + w / 2;
            let y = Math.sin(a) * rad + h / 2;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 500px 'Arial Black'";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText("9", w / 2 + 10, h / 2 - 15);
        return c.toBuffer();
    };

    for (let i = 0; i < 6; i++) {
        frames.push([frame(i), 1]);
    }
    let bxframes = [];
    for (let i = 0; i < 6; i++) {
        bxframes.push(frame(6 + i));
    }
    let flashes = [0];
    let i = 0;
    while (frames.length < 324) {
        frames.push([bxframes[i], 1]);
        i++;
        if (i == bxframes.length) i = 0;
    }
    return frames;
}

let NineballLine: Image;
async function initImages() {
    const c = createCanvas(2200, 200);
    const ctx = c.getContext("2d");
    for (let i = 0; i < 10; i++) {
        drawNineball(90 + 220 * i, 100, 90, ctx);
    }
    NineballLine = await loadImage(c.toBuffer());
}

initImages();

export default async function chirumiru(
    imageBuffers: Buffer[],
    characterName: string,
    debug: boolean = false,
    compare: boolean = false,
    startAt: string = ""
) {
    const SceneMap = {
        TAS1: true,
        TAS2: true,
        TAS3: true,
        TAS4: true,
        TAS5: true,
        TAS6: true,
        GENKI: true,
        GENKI2: true,
        MILK1: true,
        MILK2: true,
        MILK3: true,
        KONA: true,
        INTROCRED: true,
    };
    let reachedStart = false;
    if (startAt.length > 0) {
        for (const k of Object.keys(SceneMap)) {
            if (k == startAt) reachedStart = true;
            SceneMap[k] = reachedStart;
        }
    }
    console.log(SceneMap);
    characterName = characterName.toUpperCase();
    const characterImage = await loadImage(imageBuffers[0]);
    let milkImage = null;
    if (imageBuffers[1]) {
        milkImage = await loadImage(imageBuffers[1]);
    }

    const c = createCanvas(w * RESOLUTION, h * RESOLUTION);
    const ctx = c.getContext("2d");
    ctx.scale(RESOLUTION, RESOLUTION);

    const GRADIENTS = {
        BG: ctx.createLinearGradient(0, 0, 0, h),
    };
    GRADIENTS.BG.addColorStop(0, "#cadbfe");
    GRADIENTS.BG.addColorStop(1, "#4e87fe");

    let IMAGES = {
        character: characterImage,
        milk: milkImage ?? characterImage,
    };

    let frames: [Buffer, number][] = [];

    ctx.font = `900 120px 'Arial Black'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "white";
    ctx.fillText("NODRAW", w / 2, h / 2);
    const NODRAWFRAME = c.toBuffer();
    async function NODRAW(count: number) {
        return [[NODRAWFRAME, count]];
    }

    let skip = 0;
    if (startAt.length == 0) {
        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "black";
        ctx.fillText("88", w / 2, h / 2);
        ctx.font = "900 40px 'Arial Black'";
        ctx.fillText("Loading...", w / 2, h / 2 - 70);
        frames.push([c.toBuffer(), 3]);

        ctx.fillStyle = GRADIENTS.BG;
        ctx.fillRect(0, 0, w, h);
        frames.push([c.toBuffer(), 15]);
    } else {
        skip += 18;
    }

    let promises = [];
    if (SceneMap.TAS1) {
        promises.push(TAS1(IMAGES.character, characterName));
    } else {
        skip += 10;
    }
    if (SceneMap.TAS2) {
        promises.push(TAS2(IMAGES.character, characterName));
    } else {
        skip += 10;
    }
    if (SceneMap.TAS3) {
        promises.push(TAS3(IMAGES.character, characterName));
    } else {
        skip += 5;
    }
    if (SceneMap.TAS4) {
        promises.push(TAS4(IMAGES.character, characterName));
    } else {
        skip += 5;
    }
    if (SceneMap.TAS5) {
        promises.push(TAS5(IMAGES.character, characterName));
    } else {
        skip += 5;
    }
    if (SceneMap.TAS6) {
        promises.push(TAS6(IMAGES.character, characterName));
    } else {
        skip += 9;
    }
    if (SceneMap.GENKI) {
        promises.push(GENKI(IMAGES.character));
    } else {
        skip += 16;
    }
    if (SceneMap.GENKI2) {
        promises.push(GENKI2(IMAGES.character));
    } else {
        skip += 20;
    }
    if (SceneMap.MILK1) {
        promises.push(MILK1(IMAGES.milk, characterName));
    } else {
        skip += 11;
    }
    if (SceneMap.MILK2) {
        promises.push(MILK2(IMAGES.milk, characterName));
    } else {
        skip += 10;
    }
    if (SceneMap.MILK3) {
        promises.push(MILK3(IMAGES.milk, characterName));
    } else {
        skip += 24;
    }
    if (SceneMap.KONA) {
        promises.push(KONA(IMAGES.character));
    } else {
        skip += 352;
    }
    if (SceneMap.INTROCRED) {
        promises.push(INTROCRED());
    } else {
        skip += 324;
    }

    promises.push(NODRAW(1));

    promises.push(NODRAW(60));

    for (const scene of await Promise.all(promises)) {
        frames.push(...scene);
    }
    console.log(frames);

    let allFrames: Buffer[] = [];
    for (const [frame, count] of frames) {
        for (let i = 0; i < count; i++) {
            allFrames.push(frame);
        }
    }

    let skipTime = skip * (1 / 30);
    let sequence = addBufferSequence(allFrames, "png");
    let animation = await ffmpegBuffer(
        `-pattern_type sequence -r 30 -f image2 -i http://localhost:56033/${sequence} -ss ${skipTime} -i ${file(
            "chirumiru.mp3"
        )} -vf scale=1280:-2 -shortest $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sequence);

    if (compare) {
        animation = await ffmpegBuffer(
            `-i $BUF0 -ss ${skipTime} -i ${file(
                "chirumiru.mp4"
            )} -filter_complex "[1:v]null[chs];[0:v][chs]vstack=inputs=2[v]" -map "[v]" -map 0:a -shortest $PRESET $OUT`,
            [[animation, "mp4"]],
            "mp4"
        );
    }

    return animation;
}
