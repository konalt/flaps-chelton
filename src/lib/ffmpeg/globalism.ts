import { bufferToDataURL, random } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";
import videoGif from "./videogif";

async function generateSphereVideo(image: Buffer, speed: number) {
    let animation = await hookWeb3DAPIAnimation("globalism", {
        img: bufferToDataURL(image, "image/png"),
        _alpha: true,
    });
    let animationFrames: Buffer[] = [];
    const animLength = 60 / speed;
    for (let i = 0; i < animLength; i++) {
        animationFrames.push(await animation.step(i / animLength));
    }
    animation.destroy();
    let animationSequence = addBufferSequence(animationFrames, "png");
    return animationSequence;
}

function overlay(x: number, y: number) {
    return `overlay=x=${x}*W-w/2:y=${y}*H-h/2`;
}

function scale(mult: number) {
    return `scale=${mult}*iw:${mult}*ih`;
}

function randomScaleValue() {
    return scale(random(0.3, 0.6));
}
function randomPosition() {
    let pos: [number, number] = [random(0, 0.25), random(0.1, 0.9)];
    if (Math.random() > 0.5) pos = [1 - pos[0], pos[1]];
    return overlay(...pos);
}

export default async function globalism(buffers: [Buffer, string][]) {
    let sphere = await generateSphereVideo(buffers[0][0], 1);

    let animation = await ffmpegBuffer(
        [
            `-loop 1 -r 30 -i $BUF0`,
            `-stream_loop -1 -pattern_type sequence -f image2 -i http://localhost:56033/${sphere} -framerate 30`,
            `-filter_complex "`,
            "[1:v]split=3[slow][norm][fast];",
            "[slow]setpts=2*(PTS-STARTPTS),split=3[slow0][slow1][slow2];",
            "[norm]split=3[norm0][norm1][norm2];",
            "[fast]setpts=0.5*(PTS-STARTPTS),split=2[fast0][fast1];",
            `[slow0]${randomScaleValue()}[slow0];`,
            `[slow1]${randomScaleValue()}[slow1];`,
            `[slow2]${randomScaleValue()},hue=h=(1-(t/2.4))*360[slow2];`,
            `[norm0]${randomScaleValue()}[norm0];`,
            `[norm1]${randomScaleValue()}[norm1];`,
            `[norm2]${randomScaleValue()}[norm2];`,
            `[fast0]${randomScaleValue()},hue=h=(t/2.4)*360[fast0];`,
            `[fast1]${randomScaleValue()}[fast1];`,
            `[0:v]scale=512:512,setsar=1:1[out];`,
            `[out][slow0]${randomPosition()}[out];`,
            `[out][norm0]${randomPosition()}[out];`,
            `[out][fast0]${randomPosition()}[out];`,
            `[out][slow1]${randomPosition()}[out];`,
            `[out][norm1]${randomPosition()}[out];`,
            `[out][fast1]${randomPosition()}[out];`,
            `[out][slow2]${randomPosition()}[out];`,
            `[out][norm2]${randomPosition()}[out];`,
            `" -map "[out]" -r 30 -t 2.4 $PRESET $OUT`,
        ].join(" "),
        buffers,
        "mp4"
    );
    removeBuffer(sphere);
    return videoGif([[animation, "mp4"]], 30);
}
