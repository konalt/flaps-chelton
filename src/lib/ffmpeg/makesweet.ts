import { bufferToDataURL, parseOptions } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import createMakesweetText from "../canvas/createMakesweetText";
import createMakesweetFixedImage from "../canvas/createMakesweetFixedImage";
import { addBufferSequence, removeBuffer } from "../..";
import videoGif from "./videogif";

const ANIMATION = [
    [-0.01, 0.01, 2, -0.8, 20],
    [-0.1, 0.02, 2.1, -0.8, 19.9],
    [-0.2, 0.05, 2.35, -0.8, 19.8],
    [-0.3, 0.1, 2.5, -0.75, 19.7],
    [-0.35, 0.1, 2.7, -0.75, 19.6],
    [-0.4, 0.15, 3, -0.75, 19.5],
    [-0.45, 0.15, 3.3, -0.7, 19.4],
    [-0.5, 0.2, 3.7, -0.7, 19.3],
    [-0.55, 0.2, 4, -0.7, 19.2],
    [-0.6, 0.2, 4.5, -0.65, 19.1],
    [-0.625, 0.2, 4.6, -0.65, 19.1],
    [-0.65, 0.2, 4.8, -0.65, 19.0],
    [-0.7, 0.22, 5.2, -0.6, 18.8],
    [-0.75, 0.25, 6, -0.6, 18.6],
    [-0.8, 0.3, 6.5, -0.55, 18.4],
    [-0.85, 0.35, 6.9, -0.5, 18.2],
    [-0.9, 0.4, 7, -0.5, 18],
    [-0.95, 0.4, 7.5, -0.5, 18],
    [-1.1, 0.42, 8, -0.5, 18],
    [-1.15, 0.42, 8.5, -0.5, 18],
    [-1.2, 0.46, 9, -0.5, 18],
    [-1.25, 0.46, 9.5, -0.5, 18],
    [-1.3, 0.5, 10, -0.5, 18],
    [-1.35, 0.5, 10.5, -0.5, 18],
    [-1.4, 0.55, 11, -0.5, 18],
    [-1.45, 0.55, 11.5, -0.5, 18],
    [-1.5, 0.6, 12, -0.5, 18],
    [-1.55, 0.6, 12.5, -0.5, 18],
    [-1.6, 0.65, 13, -0.5, 18],
    [-1.65, 0.65, 13.5, -0.5, 18, -0.0015],
    [-1.675, 0.65, 13.75, -0.5, 18, -0.0015],
    [-1.7, 0.675, 14, -0.5, 18, -0.0015],
    [-1.725, 0.675, 14.25, -0.5, 18, -0.001],
    [-1.75, 0.675, 14.5, -0.5, 18, -0.001],
    [-1.775, 0.7, 14.85, -0.5, 18, -0.001],
    [-1.8, 0.7, 15, -0.5, 18, -0.001],
    [-1.82, 0.7, 15.1, -0.5, 18, -0.001],
];

function interpolate(frame1: number[], frame2: number[]): number[] {
    let out = [];
    let i = 0;
    for (const _ of frame1) {
        if (!frame1[i]) break;
        if (!frame2[i]) break;
        out.push((frame1[i] + frame2[i]) / 2);
        i++;
    }
    return out;
}

function locket(images: [Buffer, Buffer], options: Record<string, any>) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let heartAnimation = await hookWeb3DAPIAnimation("heartlocket", {
            img1: bufferToDataURL(images[0], "image/png"),
            img2: bufferToDataURL(images[1], "image/png"),
        });
        let heartAnimationFrames: Buffer[] = [];
        let i = 0;
        let uanim = [...ANIMATION];
        if (options.reverse) uanim.reverse();
        for (const frame of uanim) {
            let thisFrame = frame;
            let nextFrame = uanim[i + 1];
            if (!nextFrame) nextFrame = thisFrame;
            let interpolated = interpolate(thisFrame, nextFrame);
            heartAnimationFrames.push(await heartAnimation.step(...frame));
            heartAnimationFrames.push(
                await heartAnimation.step(...interpolated)
            );
            i++;
        }
        for (let i = 0; i < 30; i++) {
            heartAnimationFrames.push(heartAnimation.lastFrame());
        }
        heartAnimation.destroy();
        let heartAnimationSequence = addBufferSequence(
            heartAnimationFrames,
            "jpeg"
        );
        let heartAnimationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${heartAnimationSequence} -framerate ${options.fps} $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(heartAnimationSequence);
        resolve(heartAnimationConcat);
    });
}

export default async function makesweet(
    buffers: [Buffer, string][],
    text: string
) {
    let [options, textParsed] = parseOptions(text, {
        imgres: 384,
        fps: 20,
        reverse: false,
    });
    let resolution = options.imgres;

    // the heart uv is fucked and flips them???
    let image1 = await ffmpegBuffer(
        `-i $BUF0 -vf scale=${resolution}:${resolution}:force_original_aspect_ratio=1,pad=${resolution}:${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1:1,vflip $OUT`,
        [[await createMakesweetFixedImage(buffers[0][0]), "png"]],
        "png"
    );
    let image2: Buffer;
    if (buffers[1]) {
        image2 = await ffmpegBuffer(
            `-i $BUF0 -vf scale=${resolution}:${resolution}:force_original_aspect_ratio=1,pad=${resolution}:${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1:1,vflip,hflip $OUT`,
            [[await createMakesweetFixedImage(buffers[1][0]), "png"]],
            "png"
        );
    } else {
        image2 = await ffmpegBuffer(
            `-i $BUF0 -vf scale=${resolution}:${resolution}:force_original_aspect_ratio=1,pad=${resolution}:${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1:1,vflip,hflip $OUT`,
            [[await createMakesweetText(textParsed), "png"]],
            "png"
        );
    }

    let locketAnim = await locket([image1, image2], options);

    let gif = videoGif([[locketAnim, "mp4"]], options.fps);
    return gif;
}
