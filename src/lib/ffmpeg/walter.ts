import { addBufferSequence, removeBuffer } from "../..";
import { log, C } from "../logger";
import { bufferToDataURL, sample } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { SCALE_EVEN, ffmpegBuffer, file } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";
import stitch from "./stitch";
import videoGif from "./videogif";

async function animate(
    img: Buffer,
    dimensions: [number, number],
    direction: number
) {
    let animation = await hookWeb3DAPIAnimation("walter", {
        img: bufferToDataURL(img, "image/png"),
        imgWidth: dimensions[0],
        imgHeight: dimensions[1],
        isVertical: direction > 1,
    });
    let frames: Buffer[] = [];
    frames.push(animation.lastFrame());
    let duration = 22;
    for (let i = 1; i < duration; i++) {
        frames.push(await animation.step(i, duration, direction));
    }
    animation.destroy();
    let sequence = addBufferSequence(frames, "png");
    let video = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${sequence} -vf ${SCALE_EVEN} -framerate 60 -shortest $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sequence);
    return video;
}

export default async function walter(buffers: [Buffer, string][]) {
    let animations = [];
    for (let i = 0; i < 4; i++) {
        let anim = await animate(
            buffers[0][0],
            await getVideoDimensions(buffers[0]),
            i
        );
        animations.push(anim);
    }
    let current = sample(animations);
    for (let i = 0; i < 10; i++) {
        log(
            `Appending segment ${C.Cyan}${i + 1} ${C.White}of ${C.Cyan}22`,
            "walter"
        );
        current = await ffmpegBuffer(
            `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[o]" -map "[o]" $PRESET $OUT`,
            [
                [current, "mp4"],
                [sample(animations), "mp4"],
            ]
        );
    }
    let withAudio = await ffmpegBuffer(
        `-stream_loop -1 -i $BUF0 -i ${file("walter.mp3")} -t 19 $PRESET $OUT`,
        [[current, "mp4"]]
    );
    return withAudio;
}
