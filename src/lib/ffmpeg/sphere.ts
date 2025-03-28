import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";
import videoGif from "./videogif";

function anim(image: Buffer) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let animation = await hookWeb3DAPIAnimation("sphere", {
            img: bufferToDataURL(image, "image/png"),
        });
        let animationFrames: Buffer[] = [];
        const animLength = 100;
        for (let i = 0; i < animLength; i++) {
            animationFrames.push(await animation.step(i / animLength));
        }
        animation.destroy();
        let animationSequence = addBufferSequence(animationFrames, "png");
        let animationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${animationSequence} -framerate 24 $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(animationSequence);
        resolve(animationConcat);
    });
}

export default async function sphere(buffers: [Buffer, string][]) {
    let animation = await anim(buffers[0][0]);

    let gif = videoGif([[animation, "mp4"]], 24);
    return gif;
}
