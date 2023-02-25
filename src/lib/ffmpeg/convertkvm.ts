import { TrimOptions } from "../../types";
import { ffmpegBuffer, file, preset } from "./ffmpeg";
import { existsSync } from "fs";
import { createCanvas, loadImage } from "canvas";
import { getVideoDimensions } from "./getVideoDimensions";

function binaryStringToBuffer(string: string) {
    const groups = string.match(/[01]{8}/g) ?? [];
    const numbers = groups.map((binary: string) => parseInt(binary, 2));

    return Buffer.from(new Uint8Array(numbers).buffer);
}

function compress(data2: string) {
    var data = JSON.parse(data2);
    var text = data.join("");
    var comp = binaryStringToBuffer(text);
    return comp;
}

function himem_stringify(arr: boolean[][]) {
    return (
        "[" +
        arr
            .map(
                (mem: boolean[]) =>
                    '"' + mem.map((n) => (n ? 1 : 0)).join("") + '"'
            )
            .join(",\n") +
        "]"
    );
}

export default async function convertkvm(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        var dims = await getVideoDimensions(buffers[0][1]);
        var w = 0,
            h = 0;
        if (dims[0] > dims[1]) {
            w = 255;
            h = Math.round(255 * (dims[1] / dims[0]));
        } else {
            w = Math.round(255 * (dims[0] / dims[1]));
            h = 255;
        }
        ffmpegBuffer(
            `-i $BUF0 -framerate 20 -vf scale=${w}:${h} $OUT`,
            buffers,
            "%04d.png",
            true
        ).then(async (filename) => {
            var canvas = createCanvas(w, h);
            var ctx = canvas.getContext("2d");
            var images: boolean[][] = [];
            var i = 1;
            while (
                existsSync(
                    file(filename as string).replace(
                        /%[0-9]+d/,
                        i.toString().padStart(4, "0")
                    )
                ) &&
                i < 1500
            ) {
                var path = file(filename as string).replace(
                    /%[0-9]+d/,
                    i.toString().padStart(4, "0")
                );
                i++;
                var image = await loadImage(path);
                ctx.drawImage(image, 0, 0);
                var data = ctx.getImageData(0, 0, w, h);
                var compressedData: boolean[] = [];
                var d = data.data;
                for (var j = 0; j < d.length; j += 4) {
                    var med = (d[j] + d[j + 1] + d[j + 2]) / 3;
                    compressedData.push(med > 128);
                }
                images.push(compressedData);
                console.log(i + " done.");
            }
            var compressed = compress(himem_stringify(images));
            compressed[0] = w;
            compressed[1] = h;
            res(compressed);
        });
    });
}
