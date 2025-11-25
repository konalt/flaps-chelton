import createSnowglobeGradient from "../canvas/createSnowglobeGradient";
import { bufferToDataURL } from "../utils";
import { animate } from "../web3dapi";
import { ffmpegBuffer, file, overlayFilter } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function snowglobe(buffer: [Buffer, string], hd = false) {
    const FRAMES = 480;
    const FPS = 48;
    const DUR = FRAMES / FPS;

    let animation = await animate("snowglobe", FRAMES, FPS, {
        img0: bufferToDataURL(buffer[0], "image/png"),
        _hd: hd,
    });
    let dims = await getVideoDimensions([animation, "mp4"]);

    let grad = createSnowglobeGradient(...dims);

    let vig = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -i ${file(
            "snowglobe.mp3"
        )} -filter_complex "${overlayFilter(
            "0:v",
            "1:v",
            "out",
            0,
            0,
            ...dims
        )};[out]setpts=PTS-STARTPTS,fps=${FPS}[out];color=0xecfffeff:s=${dims.join(
            "x"
        )}:d=${DUR}:r=${FPS}[fade];[fade][out]xfade=duration=${
            DUR * 0.12
        }:offset=${
            DUR * 0.05
        }[out];[2:a]anull[outa]" -map "[out]" -map "[outa]" -shortest $PRESET $OUT`,
        [
            [animation, "mp4"],
            [grad, "png"],
        ]
    );

    return vig;
}
