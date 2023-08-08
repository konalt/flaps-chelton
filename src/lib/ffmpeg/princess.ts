import { ffmpegBuffer, file, preset } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";
import createPrincessGradient from "../../lib/canvas/createPrincessGradient";

const princessImages = [
    "crown1",
    "crown2",
    "heart1",
    "heart2",
    "ribbon1",
    "thailand1",
];

function scaleFilterKeepAR(size: number) {
    return `scale=w='if(lte(iw,ih),${size},-1)':h='if(lte(iw,ih),-1,${size})',setsar=1:1`;
}
function scaleFilter(width: number, height: number) {
    return `scale=w=${width}:h=${height},setsar=1:1`;
}
function randomRotate() {
    return `rotate=${Math.random() * 2 - 1}*PI/6:c=none`;
}

export default async function princess(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0][1]);
    let gradient = await createPrincessGradient(buffers[0][0]);
    let tmp = [];
    let princessTags = ["", "", "", ""].map((_) => {
        let filteredImages = princessImages.filter((n) => !tmp.includes(n));
        let chosen =
            filteredImages[Math.floor(Math.random() * filteredImages.length)];
        tmp.push(chosen);
        return file("images/princess/" + chosen + ".png");
    });
    let inputString = "-i " + princessTags.join(" -i ");
    let princessImageSize = 400;
    let largeImageSize = 1080;
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 ${inputString} -filter_complex "[0:v]${scaleFilter(
            ...dims
        )},${scaleFilterKeepAR(largeImageSize)}[in_img];
        [1:v]${scaleFilter(...dims)},${scaleFilterKeepAR(
            largeImageSize
        )}[in_color];
        [in_img][in_color]overlay[pink_a0];
        [2:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg1];
        [3:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg2];
        [4:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg3];
        [5:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg4];
        [pink_a0][pimg1]overlay=10:10[pink_a1];
        [pink_a1][pimg2]overlay=10:main_h-overlay_h-10[pink_a2];
        [pink_a2][pimg3]overlay=main_w-overlay_w-10:main_h-overlay_h-10[pink_a3];
        [pink_a3][pimg4]overlay=main_w-overlay_w-10:10[pink_a4]" -frames:v 1 -update 1 -map "[pink_a4]" $OUT`.replace(
            /\n +/g,
            ""
        ),
        buffers.concat([[gradient, "NUL.png"]])
    );
}
