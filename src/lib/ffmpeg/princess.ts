import { ffmpegBuffer, file } from "./ffmpeg";
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
function randomOverlay() {
    return `overlay=${Math.random()}*main_w-overlay_w/2:${Math.random()}*main_h-overlay_h/2`;
}

export default async function princess(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dims = await getVideoDimensions(buffers[0]);
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
    let princessImageSize = 300;
    let largeImageSize = 1080;
    let princessPadding = 25;
    let sparkleSize = 100;
    let sparkleCount = 20;
    let splitFilter = `split=${sparkleCount}`;
    for (let i = 0; i < sparkleCount; i++) {
        splitFilter += `[sparkle${i}]`;
    }
    let overlayFilter = `[pink_a4]null[sparkles_a0];`;
    for (let i = 0; i < sparkleCount; i++) {
        overlayFilter += `[sparkles_a${i}][sparkle${i}]${randomOverlay()}[sparkles_a${
            i + 1
        }];`;
    }
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 ${inputString} -i ${file(
            "images/princess/sparkle.png"
        )} -filter_complex "[0:v]${scaleFilter(...dims)},${scaleFilterKeepAR(
            largeImageSize
        )}[in_img];
        [1:v]${scaleFilter(...dims)},${scaleFilterKeepAR(
            largeImageSize
        )}[in_color];
        [in_img][in_color]overlay[pink_a0];
        [2:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg1];
        [3:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg2];
        [4:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg3];
        [5:v]${scaleFilterKeepAR(princessImageSize)},${randomRotate()}[pimg4];
        [pink_a0][pimg1]overlay=${princessPadding}:${princessPadding}[pink_a1];
        [pink_a1][pimg2]overlay=${princessPadding}:main_h-overlay_h-${princessPadding}[pink_a2];
        [pink_a2][pimg3]overlay=main_w-overlay_w-${princessPadding}:main_h-overlay_h-${princessPadding}[pink_a3];
        [pink_a3][pimg4]overlay=main_w-overlay_w-${princessPadding}:${princessPadding}[pink_a4];
        [6:v]${scaleFilterKeepAR(sparkleSize)},${splitFilter};
        ${overlayFilter}
        [sparkles_a${sparkleCount}]null[sparkles]" -frames:v 1 -update 1 -map "[sparkles]" $OUT`.replace(
            /\n +/g,
            ""
        ),
        buffers.concat([[gradient, "png"]])
    );
}
