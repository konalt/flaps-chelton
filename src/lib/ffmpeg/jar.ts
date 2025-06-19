import { addBufferSequence, removeBuffer } from "../..";
import { bufferToDataURL, easeOutCirc } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";
import videoGif from "./videogif";

async function animate(img: Buffer, dimensions: [number, number]) {
    let animation = await hookWeb3DAPIAnimation("jar", {
        img: bufferToDataURL(img, "image/png"),
        imgWidth: dimensions[0],
        imgHeight: dimensions[1],
    });
    let frames: Buffer[] = [];
    let duration = 48;
    for (let i = 1; i < duration; i++) {
        let x = i / duration;
        let topY = 5 - easeOutCirc(x) * 5;
        let imgY = 15 - easeOutCirc(x) * 15;
        let fovValue = 1 - (1 - x) * (1 - x);
        let fov = 40 - fovValue * 10;
        let cxValue = x * 15;
        let cx = 18 - cxValue;

        frames.push(await animation.step(topY, imgY, fov, cx));
    }
    let hold = 8;
    for (let i = 0; i < hold; i++) {
        frames.push(await animation.step(-1));
    }
    animation.destroy();
    let sequence = addBufferSequence(frames, "png");
    let video = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${sequence} -framerate 24 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sequence);
    return video;
}

export default async function pokeball(buffers: [Buffer, string][]) {
    let anim = await animate(
        buffers[0][0],
        await getVideoDimensions(buffers[0])
    );
    let gif = await videoGif([[anim, "mp4"]], 24);
    return gif;
}
