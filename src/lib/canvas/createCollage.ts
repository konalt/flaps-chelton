import { loadImage, createCanvas, Image } from "canvas";

export default (buffers: Buffer[]): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buffers[0]) return reject("An array of image buffers is required");
        let imgSize = 512;
        var proms = buffers.map((buf) => {
            return new Promise<Image>((resolve) => {
                loadImage(buf).then((img) => {
                    resolve(img);
                });
            });
        });
        Promise.all(proms).then((imgs) => {
            var w = imgSize * 2;
            var h = w;
            var c = createCanvas(w, h);
            var ctx = c.getContext("2d");
            ctx.fillStyle = "#24e632";
            ctx.fillRect(0, 0, w, h);
            var i = 0;
            for (let y = 0; y < 2; y++) {
                for (let x = 0; x < 2; x++) {
                    if (imgs[i]) {
                        ctx.drawImage(
                            imgs[i],
                            x * imgSize,
                            y * imgSize,
                            imgSize,
                            imgSize
                        );
                        i++;
                    }
                }
            }
            resolve(c.toBuffer("image/png"));
        });
    });
};
