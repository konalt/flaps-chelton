import { addBufferSequence, removeBuffer } from "../..";
import { imagemagickBuffer } from "../imagemagick/imagemagick";
import compressImage from "./compressimage";
import { ffmpegBuffer } from "./ffmpeg";
import videoGif from "./videogif";

export default async function twistvideo(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let scaled = await compressImage(buffers[0], 800, true);
    let framePromises: Promise<Buffer>[] = [];
    const frameDuration = 6 * 10;
    for (let i = 0; i < frameDuration; i++) {
        let x = i / frameDuration;
        let value = Math.sin(x * Math.PI * 2) * 200;
        framePromises.push(imagemagickBuffer(`-swirl ${value}`, scaled));
    }
    let frames = await Promise.all(framePromises);
    let sequence = addBufferSequence(frames, "png");
    let anim = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${sequence} -framerate 24 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sequence);

    return videoGif([[anim, "mp4"]], 24);
}
