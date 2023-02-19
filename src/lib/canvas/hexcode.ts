import { loadImage, createCanvas } from "canvas";
import { RGBColor } from "../../types";

export default (buf: Buffer): Promise<RGBColor> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let image = await loadImage(buf);
        var c = createCanvas(image.width, image.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        var data = ctx.getImageData(0, 0, image.width, image.height);
        var length = data.data.length;

        var blockSize = 5, // only visit every 5 pixels
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

        resolve(rgb);
    });
};
