import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer, file } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";

function anim(image0: Buffer, image1: Buffer, image2: Buffer) {
    return new Promise<Buffer>(async (resolve, reject) => {
        let animation = await hookWeb3DAPIAnimation("museum", {
            img0: bufferToDataURL(image0, "image/png"),
            img1: bufferToDataURL(image1, "image/png"),
            img2: bufferToDataURL(image2, "image/png"),
        });
        let animationFrames: Buffer[] = [];
        const animLength = 330;
        for (let i = 0; i < animLength; i++) {
            animationFrames.push(await animation.step(i / animLength));
        }
        animation.destroy();
        let animationSequence = addBufferSequence(animationFrames, "png");
        let animationConcat = await ffmpegBuffer(
            `-pattern_type sequence -f image2 -i http://localhost:56033/${animationSequence} -framerate 48 $PRESET $OUT`,
            [],
            "mp4"
        );
        removeBuffer(animationSequence);
        resolve(animationConcat);
    });
}

export default async function museum(buffers: [Buffer, string][]) {
    let animation = await anim(
        buffers[1] ? buffers[1][0] : buffers[0][0],
        buffers[0][0],
        buffers[2] ? buffers[2][0] : buffers[1] ? buffers[1][0] : buffers[0][0]
    );

    let withAudio = await ffmpegBuffer(
        `-i $BUF0 -i ${file(
            "boccherini.mp3"
        )} -map 0:v:0 -map 1:a:0 -shortest $PRESET $OUT`,
        [[animation, "mp4"]]
    );

    return withAudio;
}
