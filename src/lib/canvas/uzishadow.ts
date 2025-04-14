import { loadImage, createCanvas, Canvas, ImageData } from "canvas";
import { calculateAspectRatioFit } from "../utils";
import removeBackground from "../removebg";
import { ffmpegBuffer, file } from "../ffmpeg/ffmpeg";

function getImageBounds(imageData: ImageData) {
    let threshold = 4;
    let sx = Infinity;
    let sy = Infinity;
    let ex = 0;
    let ey = 0;
    let iw = imageData.width;
    let ih = imageData.height;
    let data = imageData.data;
    for (let y = 0; y < ih; ++y) {
        for (let x = 0; x < iw; ++x) {
            let index = (y * iw + x) * 4;
            let alpha = data[index + 3];
            if (alpha > threshold) {
                sx = Math.min(x, sx);
                sy = Math.min(y, sy);
                ex = Math.max(x, ex);
                ey = Math.max(y, ey);
            }
        }
    }
    return [sx, sy, ex - sx, ey - sy];
}

async function imageHasTransparency(buffer: Buffer) {
    let image = await loadImage(buffer);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, image.width, image.height);
    let iw = imageData.width;
    let ih = imageData.height;
    let data = imageData.data;
    let threshold = 4;
    for (let y = 0; y < ih; ++y) {
        for (let x = 0; x < iw; ++x) {
            let index = (y * iw + x) * 4;
            let alpha = data[index + 3];
            if (alpha < threshold) {
                return true;
            }
        }
    }
    return false;
}

async function cropImageToBounds(imageBuffer: Buffer) {
    let image = await loadImage(imageBuffer);
    let c = createCanvas(image.width, image.height);
    let ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, image.width, image.height);
    let [x, y, w, h] = getImageBounds(imageData);
    let newImageData = ctx.getImageData(x, y, w, h);
    let c2 = createCanvas(w + 2, h + 2);
    let ctx2 = c2.getContext("2d");
    ctx2.putImageData(newImageData, 1, 1);
    return c2.toBuffer();
}

const PERSP_OFFSET = [-58, 0];
//const PERSPECTIVE = [0, 262, 291, 150, 292, 525, 598, 408];
const PERSPECTIVE = [
    0 + PERSP_OFFSET[0],
    453 + PERSP_OFFSET[1],
    233 + PERSP_OFFSET[0],
    328 + PERSP_OFFSET[1],
    417 + PERSP_OFFSET[0],
    909 + PERSP_OFFSET[1],
    678 + PERSP_OFFSET[0],
    679 + PERSP_OFFSET[1],
];

export default async function uziShadow(buf: Buffer) {
    let background = await loadImage("images/uzishadow/noshadow2.png");
    let uzi = await loadImage("images/uzishadow/uzi.png");
    let backgroundRemoved = buf;
    if (!(await imageHasTransparency(backgroundRemoved))) {
        backgroundRemoved = await removeBackground(buf);
    }
    let cropped = await cropImageToBounds(backgroundRemoved);
    const [w, h] = [background.width, background.height];
    let perspectiveWarp = await ffmpegBuffer(
        `-i $BUF0 -vf hflip,scale=${w}:${h},perspective=${PERSPECTIVE.join(
            ":"
        )}:sense=1 $OUT`,
        [[cropped, "png"]]
    );
    let shadowTexture = await ffmpegBuffer(
        `-i $BUF0 -i ${file(
            "uzishadow/shadowtexture.png"
        )} -filter_complex "[0:v]alphaextract,gblur=sigma=2[alpha];[1:v][alpha]alphamerge[out]" -map "[out]" $OUT`,
        [[perspectiveWarp, "png"]]
    );
    let shadowTextureImage = await loadImage(shadowTexture);
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.drawImage(background, 0, 0);
    ctx.drawImage(shadowTextureImage, 0, 0);
    ctx.restore();
    ctx.drawImage(uzi, 349, 53);
    return c.toBuffer();
}
