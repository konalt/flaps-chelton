import { Shoebill } from "../../types";
import createShoebillFrame from "../canvas/createShoebillFrame";
import { ffmpegBuffer, file } from "./ffmpeg";
import { readFile } from "fs/promises";
import { addBufferSequence, removeBuffer } from "../..";

export default async function whatever(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    const shoebillDataBasic: string[] = (
        await readFile("images/data/frames/whatever.dat", "utf-8")
    ).split("\n");
    let shoebillData: [Shoebill[], number][] = [];
    for (const line of shoebillDataBasic) {
        let frameNumber = parseInt(line.split(" ")[0]);
        let frameData = line
            .split(" ")
            .slice(1)
            .join(" ")
            .split(",")
            .map((r) => r.split(" ").map((q) => parseFloat(q)));
        let outFrame: Shoebill[] = [];
        for (const sb of frameData) {
            outFrame.push({
                x: sb[0],
                y: sb[1],
                rotate: sb[2],
                scaleFactor: sb[3],
            });
        }
        shoebillData.push([outFrame, frameNumber]);
    }
    let promises: Promise<[Buffer, number]>[] = [];
    let mf = 0;
    for (const [shoebills, frameNumber] of shoebillData) {
        promises.push(
            new Promise<[Buffer, number]>(async (resolve, reject) => {
                resolve([
                    await createShoebillFrame(
                        shoebills,
                        buffers[0][0],
                        [338, 336],
                        [100, 100]
                    ),
                    frameNumber,
                ]);
            })
        );
        mf = frameNumber;
    }
    let images = await Promise.all(promises);
    let newImages: Buffer[] = [];
    let last: Buffer = images[0][0];
    for (let i = 0; i <= mf; i++) {
        let r = images.find((l) => l[1] == i);
        if (r) {
            last = r[0];
            newImages.push(r[0]);
        } else {
            newImages.push(last);
        }
    }
    let sequence = addBufferSequence(newImages, "png");
    let anim = await ffmpegBuffer(
        `-i ${file(
            "whatever.mp4"
        )} -pattern_type sequence -r 30 -f image2 -i http://localhost:56033/${sequence} -filter_complex "[0:v][1:v]overlay=0:0[o]" -map "[o]" $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sequence);
    return anim;
}
