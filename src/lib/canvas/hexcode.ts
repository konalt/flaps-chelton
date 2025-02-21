import { loadImage, createCanvas } from "canvas";
import { RGBColor } from "../../types";

export default async function hexCode(buf: Buffer): Promise<RGBColor> {
    let image = await loadImage(buf);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    let data = ctx.getImageData(0, 0, image.width, image.height);
    let length = data.data.length;

    let blockSize = 5, // only visit every 5 pixels
        i = -4,
        rgb: RGBColor = { r: 0, g: 0, b: 0 },
        count = 0;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;
}
