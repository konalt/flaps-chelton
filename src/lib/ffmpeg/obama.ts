import { bufferToDataURL } from "../utils";
import { animate } from "../web3dapi";
import videoGif from "./videogif";

export default async function obama(buffers: [Buffer, string][]) {
    let animation = await animate("obama", 100, 12, {
        img: bufferToDataURL(buffers[0][0], "image/png"),
    });

    let gif = videoGif([[animation, "mp4"]], 12);
    return gif;
}
