import { addBufferSequence, removeBuffer } from "../..";
import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";
import videoGif from "./videogif";

async function animate(img: Buffer, dimensions: [number, number]) {
    let animation = await hookWeb3DAPIAnimation("pokeball", {
        img: bufferToDataURL(img, "image/png"),
        imgWidth: dimensions[0],
        imgHeight: dimensions[1],
    });
    let frames: Buffer[] = [];
    let duration = 48;
    for (let i = 1; i < duration; i++) {
        let x = i / duration;
        let open =
            x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
        let fovValue = 1 - (1 - x) * (1 - x);
        let fov = 30 - fovValue * 20;
        let cxValue = x * 7;
        let cx = 18 - cxValue;

        frames.push(await animation.step(open, fov, cx));
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
