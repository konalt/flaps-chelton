import * as tf from "@tensorflow/tfjs-node";
import { Canvas, Image, ImageData, createCanvas, loadImage } from "canvas";
import * as faceapi from "@vladmandic/face-api";
import { file } from "./ffmpeg/ffmpeg";

faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);

faceapi.nets.ssdMobilenetv1.loadFromDisk(file("data/facemodel/"));

export async function detectFace(buffer: Buffer) {
    const img = await loadImage(buffer);
    const c = createCanvas(img.width, img.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return await faceapi.detectSingleFace(c as any);
}
