import { createCanvas, loadImage } from "canvas";
import { addBufferSequence, removeBuffer } from "../..";
import { ffmpegBuffer, file } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";
import { readFile } from "fs/promises";
import { PLACEHOLDER_IMAGE, bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";

const w = 800;
const h = 556;
const fps = 30;
const duration = 11.37;

const BACKGROUND_GRADIENTS: [number, [number, string][]][] = [
    [
        1.5,
        [
            [0, "#36fc28"],
            [0.1, "#36fc28"],
            [0.3, "#f46f11"],
            [0.4, "#f46f11"],
            [0.5, "#f46f11"],
            [0.6, "#f4e111"],
            [0.7, "#f4e111"],
            [0.8, "#fc02df"],
            [1, "#fc02df"],
        ],
    ],
    [
        1.8,
        [
            [0, "#36fc28"],
            [0.1, "#36fc28"],
            [0.3, "#f46f11"],
            [0.4, "#f46f11"],
            [0.5, "#f46f11"],
            [0.6, "#f4e111"],
            [0.7, "#f4e111"],
            [0.8, "#fc02df"],
            [1, "#fc02df"],
        ],
    ],
    [
        1.5,
        [
            [0, "#f9f21b"],
            [0.3, "#f9f21b"],
            [0.35, "#fc02df"],
            [0.5, "#fc02df"],
            [0.6, "#1d2ff4"],
            [0.7, "#1d2ff4"],
            [1, "#11f41c"],
        ],
    ],
];
const ACROSS_SPIN_FRAMES = [
    [w * 0.0, h / 2, 0, 1],
    [w * 0.1, h / 2 - 30, 0, 1],
    [w * 0.2, h / 2, 0, 1],
    [w * 0.3, h / 2 - 30, 0, 1],
    [w * 0.4, h * 0.45, -10, 1.2],
    [w * 0.5, h * 0.4, -45, 1.4],
    [w * 0.5, h * 0.4, -120, 1.5],
    [w * 0.5, h * 0.4, 120, 1.5],
    [w * 0.5, h * 0.4, 45, 1.4],
    [w * 0.5, h * 0.45, 10, 1.2],
    [w * 0.6, h / 2, 0, 1],
    [w * 0.7, h / 2 - 30, 0, 1],
    [w * 0.8, h / 2, 0, 1],
    [w * 0.9, h / 2 - 30, 0, 1],
    [w * 1.0, h / 2, 0, 1],
];
const SPIN_ANIM_FRAMES = 10;
const LYRICS: [number, string][] = [
    [0, "ヤババイナ バッドなミュージック"],
    [53, "ちゃっかりしっくり鳴ってんだ"],
    [90, "Vi Vinyl 掘ったら掘ったで"],
    [134, "雑多唸ってんDOWN DOWN"],
    [172, "ヤババイナ バッドな休日"],
    [216, "やっぱりかったりぃなってんだ"],
    [252, "サバイバーさっさとバツ！"],
    [292, "してやったりなんまいだ"],
    [342, ""],
];

async function imageSequenceToVideo(
    sequence: Buffer[],
    audio?: Buffer
): Promise<Buffer> {
    let duration = sequence.length * fps;
    let sequenceReference = addBufferSequence(sequence, "png");
    if (audio) {
        duration = await getVideoLength([audio, "mp3"]);
    }
    let video = await ffmpegBuffer(
        `${
            audio ? "-loop 1 " : ""
        }-pattern_type sequence -r ${fps} -f image2 -i http://localhost:56033/${sequenceReference} ${
            audio ? "-i $BUF0" : "-an"
        } -t ${duration} $PRESET $OUT`,
        audio ? [[audio, "mp3"]] : [],
        "mp4"
    );
    removeBuffer(sequenceReference);
    return video;
}

async function createSpinAnimation(image = PLACEHOLDER_IMAGE) {
    let animation = await hookWeb3DAPIAnimation("yababaina_3dspin", {
        img: bufferToDataURL(image, "image/png"),
        _alpha: true,
    });
    let animationFrames: Buffer[] = [];
    for (let i = 0; i < SPIN_ANIM_FRAMES; i++) {
        animationFrames.push(await animation.step(i / SPIN_ANIM_FRAMES));
    }
    animation.destroy();
    return animationFrames;
}

async function createBackground() {
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    let outputFrames: Buffer[] = [];
    for (const [scale, stops] of BACKGROUND_GRADIENTS) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale((w / h) * scale, scale);
        ctx.translate(-w / 2, -h / 2);
        let gradient = ctx.createRadialGradient(
            w / 2,
            h / 2,
            0,
            w / 2,
            h / 2,
            h / 2
        );
        for (const stop of stops) {
            gradient.addColorStop(...stop);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        outputFrames.push(canvas.toBuffer());
        ctx.restore();
    }
    return outputFrames;
}

async function createAcrossSpinAnimation(img: Buffer) {
    const image = await loadImage(img);
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    let imgSize = 200;

    let clearedBuffer = canvas.toBuffer();
    const addClear = (frames = 1) => {
        for (let i = 0; i < frames; i++) {
            outputFrames.push(clearedBuffer);
        }
    };
    let outputFrames: Buffer[] = [];
    for (const [x, y, r, s] of ACROSS_SPIN_FRAMES) {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((r * Math.PI) / 180);
        ctx.scale(s, s);
        ctx.translate(-x, -y);
        ctx.drawImage(
            image,
            x - imgSize / 2,
            y - imgSize / 2,
            imgSize,
            imgSize
        );
        ctx.restore();
        outputFrames.push(canvas.toBuffer());
    }
    addClear(15);
    for (const [x, y, r, s] of [...ACROSS_SPIN_FRAMES].reverse()) {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((r * Math.PI) / 180);
        ctx.scale(s, s);
        ctx.translate(-x, -y);
        ctx.drawImage(
            image,
            x - imgSize / 2,
            y - imgSize / 2,
            imgSize,
            imgSize
        );
        ctx.restore();
        outputFrames.push(canvas.toBuffer());
    }
    addClear(15);
    return outputFrames;
}

async function createTrioAnimation(img: Buffer) {
    let imgSize = 210;
    let horizontalOffset = 200;
    let verticalOffset = 50;
    const image = await loadImage(img);
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");
    let outputFrames: Buffer[] = [];
    ctx.save();
    ctx.translate(w / 2 - horizontalOffset, h / 2 + verticalOffset);
    ctx.rotate((-15 * Math.PI) / 180);
    ctx.drawImage(
        image,
        -imgSize / 2,
        (-imgSize * 1.2) / 2,
        imgSize,
        imgSize * 1.2
    );
    ctx.restore();
    ctx.save();
    ctx.translate(w / 2 + horizontalOffset, h / 2 + verticalOffset);
    ctx.rotate((15 * Math.PI) / 180);
    ctx.drawImage(
        image,
        -imgSize / 2,
        (-imgSize * 1.2) / 2,
        imgSize,
        imgSize * 1.2
    );
    ctx.restore();
    ctx.save();
    ctx.drawImage(
        image,
        w / 2 - imgSize / 2,
        h / 2 - (imgSize * 1.2 * 1.2) / 2,
        imgSize * 1.2,
        imgSize * 1.2 * 1.2
    );
    outputFrames.push(canvas.toBuffer());
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 - horizontalOffset, h / 2 + verticalOffset);
    ctx.rotate((-15 * Math.PI) / 180);
    ctx.drawImage(
        image,
        -imgSize / 2,
        (-imgSize * 1.4) / 2,
        imgSize,
        imgSize * 1.4
    );
    ctx.restore();
    ctx.save();
    ctx.translate(w / 2 + horizontalOffset, h / 2 + verticalOffset);
    ctx.rotate((15 * Math.PI) / 180);
    ctx.drawImage(
        image,
        -imgSize / 2,
        (-imgSize * 1.4) / 2,
        imgSize,
        imgSize * 1.4
    );
    ctx.restore();
    ctx.drawImage(
        image,
        w / 2 - imgSize / 2,
        h / 2 - (imgSize * 1.4 * 1.2) / 2,
        imgSize * 1.2,
        imgSize * 1.4 * 1.2
    );
    outputFrames.push(canvas.toBuffer());
    return outputFrames;
}

async function createLyrics() {
    const canvas = createCanvas(w, 50);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "red";
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 5;
    ctx.textAlign = "center";
    ctx.font = "bold 48px sans-serif";
    let outputFrames: Buffer[] = [];
    let lastFrame: Buffer;
    let total = LYRICS.at(-1)[0];
    for (let i = 0; i < total; i++) {
        let testLine = LYRICS.find((l) => l[0] == i);
        if (testLine) {
            ctx.clearRect(0, 0, w, 50);
            ctx.strokeText(testLine[1], w / 2, 40, w * 0.9);
            ctx.fillText(testLine[1], w / 2, 40, w * 0.9);
            lastFrame = canvas.toBuffer();
        }
        outputFrames.push(lastFrame);
    }
    return outputFrames;
}

function overlayFilter(
    bottomSpec: string,
    topSpec: string,
    outSpec: string,
    x: number,
    y: number,
    width: number,
    height: number,
    jiggle = 0
) {
    let jiggleEquation = jiggle > 0 ? `+(random(0)-0.5)*${jiggle}` : "";
    let jiggleEval = jiggle > 0 ? ":eval=frame" : "";
    return `[${topSpec}]scale=${width}:${height}[o];[${bottomSpec}][o]overlay='${x}${jiggleEquation}:${y}${jiggleEquation}${jiggleEval}'[${outSpec}]`;
}

export default async function yababaina(img: Buffer) {
    let promiseBackground = createBackground();
    let promiseLyrics = createLyrics();
    let promiseSpinAnimation = createSpinAnimation(img);
    let promiseAcrossSpinAnimation = createAcrossSpinAnimation(img);
    let promiseTrioAnimation = createTrioAnimation(img);

    let [
        spinAnimation,
        acrossSpinAnimation,
        trioAnimation,
        lyrics,
        background,
    ] = await Promise.all([
        promiseSpinAnimation,
        promiseAcrossSpinAnimation,
        promiseTrioAnimation,
        promiseLyrics,
        promiseBackground,
    ]);

    let spinAnimationReference = addBufferSequence(spinAnimation, "png");
    let acrossSpinAnimationReference = addBufferSequence(
        acrossSpinAnimation,
        "png"
    );
    let trioAnimationReference = addBufferSequence(trioAnimation, "png");
    let lyricsReference = addBufferSequence(lyrics, "png");
    let backgroundReference = addBufferSequence(background, "png");

    const trioMainScaleFunc = `if(
        lt(t\\,0.7)\\,
            1+(1-(t/0.7))\\,
        if(between(t\\,4.9\\,5.4)\\,
            1+(1-((t-4.9)/(5.4-4.9)))\\,
        if(between(t\\,5.9\\,6.2)\\,
            if(lt(t\\,6.05)\\,
                1+(t-5.9)/0.15\\,
            1+(1-(t-6.05)/0.15))\\,
        1)))`;
    let final = await ffmpegBuffer(
        [
            `-pattern_type sequence -r ${fps} -stream_loop -1 -f image2 -i http://localhost:56033/${backgroundReference}`,
            `-pattern_type sequence -r ${fps} -stream_loop -1 -f image2 -i http://localhost:56033/${spinAnimationReference}`,
            `-pattern_type sequence -r ${fps} -stream_loop -1 -f image2 -i http://localhost:56033/${acrossSpinAnimationReference}`,
            `-pattern_type sequence -r ${fps} -stream_loop -1 -f image2 -i http://localhost:56033/${trioAnimationReference}`,
            `-pattern_type sequence -r ${fps} -stream_loop -1 -f image2 -i http://localhost:56033/${lyricsReference}`,
            `-i ${file("yababaina.mp3")}`,
            `-filter_complex "[1:v]split=2[spin_l][spin_r_noflip];[spin_r_noflip]hflip[spin_r];`,
            `[3:v]split=3[trio_main_ns][trio_big_noscale][trio_big2_noscale];[trio_big_noscale]scale=2.6*iw:2.6*ih[trio_big];[trio_big2_noscale]scale=1.3*iw:2.4*ih[trio_big2];`,
            `[trio_main_ns]scale='${trioMainScaleFunc}*iw:${trioMainScaleFunc}*ih:eval=frame'[trio_main];`,
            "[0:v][trio_main]overlay='W/2-w/2:H/2-h/2:eval=frame:enable=not(between(t\\,3.3\\,4.9))'[o_toacross];",
            overlayFilter("o_toacross", "2:v", "o_tospins", 0, 0, w, h),
            ";",
            overlayFilter(
                "o_tospins",
                "spin_l",
                "o_sl",
                w / 8 - 200,
                h / 2 - 100,
                400,
                400,
                30
            ),
            ";",
            overlayFilter(
                "o_sl",
                "spin_r",
                "o_spins",
                (w / 8) * 7 - 200,
                h / 2 - 100,
                400,
                400,
                30
            ),
            `;[o_spins][trio_big]overlay='W/2-w*0.9+min((t-3.3)/1.4\\,1)*w*0.6:H/2-h/2:eval=frame:enable=between(t\\,3.3\\,4.9)'[o_tb]`,
            `;[o_tb][trio_big2]overlay='W/2-w/2:H/2-h/2+50:eval=frame:enable=gt(t\\,10)'[o_tb2]`,
            `;[o_tb2][4:v]overlay=0:H-h[out_final]`,
            `;[5:a]anull[out_audio]"`,
            `-map "[out_audio]" -map "[out_final]" -t ${duration} $PRESET $OUT`,
        ].join(" "),
        [],
        "mp4"
    );
    removeBuffer(spinAnimationReference);
    removeBuffer(acrossSpinAnimationReference);
    removeBuffer(trioAnimationReference);
    removeBuffer(lyricsReference);
    removeBuffer(backgroundReference);
    return final;
}
