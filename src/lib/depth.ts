import fetch from "node-fetch";
import { bufferToDataURL } from "./utils";
import { createCanvas, loadImage } from "canvas";

export default async function getDepthMap(img: Buffer) {
    let url = bufferToDataURL(img, "image/png");
    let curl =
        url.split(",")[0] +
        "," +
        url.split(",")[1].replace(/\//g, "-").replace(/\+/g, "_");
    let response = await fetch(
        `http://localhost:${process.env.DEPTHMAP_SERVER_PORT}/depth`,
        {
            method: "POST",
            body: JSON.stringify({
                img: curl,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then((r) => r.arrayBuffer());
    let image = await loadImage(Buffer.from(response));
    let canvas = createCanvas(image.width, image.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    let imageData = ctx.getImageData(0, 0, image.width, image.height);
    let max = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > max) max = imageData.data[i];
    }
    let fac = 255 / max;
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] =
            imageData.data[i + 1] =
            imageData.data[i + 2] =
                imageData.data[i] * fac;
    }
    ctx.putImageData(imageData, 0, 0);
    let buf = canvas.toBuffer();
    return buf;
}
