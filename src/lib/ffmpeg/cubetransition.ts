import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";
import videoGif from "./videogif";
import stitch from "./stitch";

function anim(image1: Buffer, image2: Buffer, loops = false) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let animation = await hookWeb3DAPIAnimation("cubetransition", {
            image1: bufferToDataURL(image1, "image/png"),
            image2: bufferToDataURL(image2, "image/png"),
        });
        let animationFrames: Buffer[] = [];
        const animLength = 60;
        for (let i = 0; i < animLength * (loops ? 2 : 1); i++) {
            animationFrames.push(await animation.step(i / animLength));
        }
        animation.destroy();
        let animationSequence = addBufferSequence(animationFrames, "png");
        let animationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${animationSequence} -framerate 30 $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(animationSequence);
        resolve(animationConcat);
    });
}

export default async function cubeTransition(
    buffers: [Buffer, string][],
    makeGif = true
) {
    let animation = await anim(buffers[0][0], buffers[1][0], makeGif);

    if (makeGif) {
        let gif = videoGif([[animation, "mp4"]], 30);
        return gif;
    } else {
        return animation;
    }
}
