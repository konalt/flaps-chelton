import { addBufferSequence, removeBuffer } from "../..";
import compressImage from "../ffmpeg/compressimage";
import { ffmpegBuffer, gifPalette } from "../ffmpeg/ffmpeg";
import { getVideoDimensions } from "../ffmpeg/getVideoDimensions";
import videoGif from "../ffmpeg/videogif";
import { imagemagickBuffer } from "./imagemagick";

export default async function distortGIF(
    buffer: Buffer,
    factorStart = 1.5,
    factorEnd = 0.5,
    frameCount = 36
) {
    let scaled = await compressImage([buffer, "png"], 400, true);
    let dims = await getVideoDimensions([scaled, "png"], true);
    let outs: Promise<Buffer>[] = [];
    for (let i = 0; i < frameCount; i++) {
        outs.push(
            imagemagickBuffer(
                `-liquid-rescale ${dims
                    .map(
                        (r) =>
                            r *
                            (factorStart +
                                (i / frameCount) * (factorEnd - factorStart))
                    )
                    .join("x")} -implode 0.25`,
                scaled
            ).then((b) =>
                ffmpegBuffer(`-i $BUF0 -vf scale=${dims.join("x")} $OUT`, [
                    [b, "png"],
                ])
            )
        );
    }
    let bufs = await Promise.all(outs);
    let seq = addBufferSequence(bufs, "png");
    let gif = await ffmpegBuffer(
        `-r 12 -pattern_type sequence -f image2 -i http://localhost:56033/${seq} -filter_complex "${gifPalette(
            "0:v",
            "out"
        )}" -map "[out]" -framerate 18 $OUT`,
        [],
        "gif"
    );
    return gif;
}
