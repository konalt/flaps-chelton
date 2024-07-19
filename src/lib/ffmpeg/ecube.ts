import { lookup } from "mime-types";
import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";
import crop from "./crop";
import videoGif from "./videogif";

function plane(image: Buffer) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let planeAnimation = await hookWeb3DAPIAnimation("ecube_2planes", {
            imageURL: bufferToDataURL(image, "image/png"),
        });
        let planeAnimationFrames: Buffer[] = [];
        planeAnimationFrames.push(await planeAnimation.step(0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.1, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.1, 25));
        planeAnimationFrames.push(await planeAnimation.step(-0.1, 24.5));
        planeAnimationFrames.push(await planeAnimation.step(-0.1, 24));
        planeAnimationFrames.push(await planeAnimation.step(-0.05, 23.5));
        planeAnimationFrames.push(await planeAnimation.step(-0.03, 22));
        planeAnimationFrames.push(await planeAnimation.step(-0.03, 20.5));
        planeAnimationFrames.push(await planeAnimation.step(-0.03, 19));
        planeAnimationFrames.push(await planeAnimation.step(0, 17, true));
        planeAnimationFrames.push(await planeAnimation.step(0, 15));
        planeAnimation.destroy();
        let planeAnimationSequence = addBufferSequence(
            planeAnimationFrames,
            "png"
        );
        let planeAnimationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${planeAnimationSequence} -framerate 20 $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(planeAnimationSequence);
        resolve(planeAnimationConcat);
    });
}

function heart(image: Buffer) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let heartAnimation = await hookWeb3DAPIAnimation("ecube_hearts", {
            imageURL: bufferToDataURL(image, "image/png"),
        });
        let heartAnimationFrames: Buffer[] = [];
        heartAnimationFrames.push(await heartAnimation.step(0, 1.5));
        heartAnimationFrames.push(await heartAnimation.step(0, 1.4));
        heartAnimationFrames.push(await heartAnimation.step(0, 1.2));
        heartAnimationFrames.push(await heartAnimation.step(0, 0.8));
        heartAnimationFrames.push(await heartAnimation.step(0, 0.7));
        heartAnimationFrames.push(await heartAnimation.step(0, 0.6));
        heartAnimationFrames.push(await heartAnimation.step(0, 0.5));
        heartAnimationFrames.push(await heartAnimation.step(0.05, 0.3));
        heartAnimationFrames.push(await heartAnimation.step(0.1, 0.2));
        heartAnimationFrames.push(await heartAnimation.step(0.1, 0.15));
        heartAnimationFrames.push(await heartAnimation.step(0.15, 0.1));
        heartAnimationFrames.push(await heartAnimation.step(0.2, 0.05));
        heartAnimationFrames.push(await heartAnimation.step(0.3, 0));
        heartAnimationFrames.push(await heartAnimation.step(0.4, 0));
        heartAnimationFrames.push(await heartAnimation.step(0.5, 0));
        heartAnimationFrames.push(await heartAnimation.step(0.64, 0));
        heartAnimationFrames.push(await heartAnimation.step(0.88, 0));
        heartAnimationFrames.push(await heartAnimation.step(1.1, 0));
        heartAnimationFrames.push(await heartAnimation.step(1.3, 0));
        heartAnimationFrames.push(await heartAnimation.step(1.5, 0));
        heartAnimation.destroy();
        let heartAnimationSequence = addBufferSequence(
            heartAnimationFrames,
            "png"
        );
        let heartAnimationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${heartAnimationSequence} -framerate 20 $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(heartAnimationSequence);
        resolve(heartAnimationConcat);
    });
}
function slice(image: Buffer) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let leftSideP = crop([[image, "png"]], {
            x: 0,
            y: 0,
            width: 50,
            height: 100,
            mode: "percent",
        });
        let rightSideP = crop([[image, "png"]], {
            x: 50,
            y: 0,
            width: 50,
            height: 100,
            mode: "percent",
        });
        let [leftSide, rightSide] = await Promise.all([leftSideP, rightSideP]);
        let sliceAnimation = await hookWeb3DAPIAnimation("ecube_sliced", {
            leftSideImageURL: bufferToDataURL(leftSide, "image/png"),
            rightSideImageURL: bufferToDataURL(rightSide, "image/png"),
        });
        let sliceAnimationFrames: Buffer[] = [];
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.5, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.48, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.45, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.4, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.34, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.26, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.14, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.0, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 0.85, 25));
        sliceAnimationFrames.push(await sliceAnimation.step(0.55, 0.7, 25.5));
        sliceAnimationFrames.push(await sliceAnimation.step(0.545, 0.5, 26));
        sliceAnimationFrames.push(await sliceAnimation.step(0.54, 0.3, 27));
        sliceAnimationFrames.push(await sliceAnimation.step(0.535, 0.05, 28));
        sliceAnimationFrames.push(await sliceAnimation.step(0.525, 0, 29));
        sliceAnimationFrames.push(await sliceAnimation.step(0.515, 0, 31));
        sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 33));
        sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 35));
        sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 36));
        sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 36.5));
        sliceAnimation.destroy();
        let sliceAnimationSequence = addBufferSequence(
            sliceAnimationFrames,
            "png"
        );
        let sliceAnimationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${sliceAnimationSequence} -framerate 20 $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(sliceAnimationSequence);
        resolve(sliceAnimationConcat);
    });
}

function zoomRotate(image: Buffer) {
    return new Promise<Buffer>(async (resolve, reject) => {
        resolve(
            await ffmpegBuffer(
                `-loop 1 -i $BUF0 -f lavfi -i "color=d=0.6:s=512x512" -filter_complex "
    [0:v]scale=512:512,setsar=1:1[scaled];
    [scaled]pad=w=1.5*iw:1.5*ih:x=-1:y=-1[padded];
    [padded]rotate=max(pow((t-0.1)*2\\,3)\\,0)[rotating];
    [rotating]scale=max(1-3*t+0.5\\,0.7)*iw:-1:eval=frame[scaling];
    [1:v][scaling]overlay=x=main_w/2-overlay_w/2:y=main_h/2-overlay_h/2[out]" -map "[out]" -t 0.6 $PRESET $OUT`,
                [[image, "png"]],
                "mp4"
            )
        );
    });
}

export default async function ecube(buffers: [Buffer, string][]) {
    let resolution = 512;

    let image = await ffmpegBuffer(
        `-i $BUF0 -vf scale=${resolution}:${resolution}:force_original_aspect_ratio=1,pad=${resolution}:${resolution}:(ow-iw)/2:(oh-ih)/2,setsar=1:1 $OUT`,
        buffers,
        "png"
    );

    let [zoomRotateOutput, planeAnimation, heartAnimation, sliceAnimation] =
        await Promise.all([
            zoomRotate(image),
            plane(image),
            heart(image),
            slice(image),
        ]);

    let zoomAndPlane = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[out]" -map "[out]" $PRESET $OUT`,
        [
            [zoomRotateOutput, "mp4"],
            [planeAnimation, "mp4"],
        ]
    );
    let zoomPlaneAndHeart = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[out]" -map "[out]" $PRESET $OUT`,
        [
            [zoomAndPlane, "mp4"],
            [heartAnimation, "mp4"],
        ]
    );
    let zoomPlaneHeartAndSlice = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[out]" -map "[out]" $PRESET $OUT`,
        [
            [zoomPlaneAndHeart, "mp4"],
            [sliceAnimation, "mp4"],
        ]
    );

    let gif = videoGif([[zoomPlaneHeartAndSlice, "mp4"]]);

    return gif;
}
