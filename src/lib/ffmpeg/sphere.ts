import { bufferToDataURL } from "../utils";
import { animate } from "../web3dapi";
import videoGif from "./videogif";

export default async function sphere(buffers: [Buffer, string][]) {
    let animation = await animate("sphere", 100, 24, {
        img: bufferToDataURL(buffers[0][0], "image/png"),
    });

    let gif = videoGif([[animation, "mp4"]], 24);
    return gif;
}
