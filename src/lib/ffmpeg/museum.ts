import { bufferToDataURL } from "../utils";
import { animate } from "../web3dapi";
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function museum(buffers: [Buffer, string][]) {
    let animation = await animate("museum", 330, 48, {
        img0: bufferToDataURL(
            buffers[1] ? buffers[1][0] : buffers[0][0],
            "image/png"
        ),
        img1: bufferToDataURL(buffers[0][0], "image/png"),
        img2: bufferToDataURL(
            buffers[2]
                ? buffers[2][0]
                : buffers[1]
                ? buffers[1][0]
                : buffers[0][0],
            "image/png"
        ),
    });

    let withAudio = await ffmpegBuffer(
        `-i $BUF0 -i ${file(
            "boccherini.mp3"
        )} -map 0:v:0 -map 1:a:0 -shortest $PRESET $OUT`,
        [[animation, "mp4"]]
    );

    return withAudio;
}
