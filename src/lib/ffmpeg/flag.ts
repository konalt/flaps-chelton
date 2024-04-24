import { addBufferSequence, removeBuffer } from "../..";
import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";
import videoGif from "./videogif";

async function animate(img: Buffer, dimensions: [number, number]) {
    let animation = await hookWeb3DAPIAnimation("flag", {
        img: bufferToDataURL(img, "image/png"),
        imgWidth: dimensions[0],
        imgHeight: dimensions[1],
    });
    let frames: Buffer[] = [];
    for (let i = 1; i < 21; i++) {
        frames.push(await animation.step(i));
    }
    animation.destroy();
    let sequence = addBufferSequence(frames, "jpeg");
    let video = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${sequence} -framerate 24 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sequence);
    return video;
}

export default async function flag(buffers: [Buffer, string][]) {
    let anim = await animate(
        buffers[0][0],
        await getVideoDimensions(buffers[0])
    );
    let gif = await videoGif([[anim, "mp4"]], 24);
    return gif;
}
