import { loadImage, createCanvas } from "canvas";

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        loadImage(buf).then((img) => {
            var c = createCanvas(img.width, img.height);
            var ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            var data = ctx.getImageData(0, 0, img.width, img.height);
            var d = data.data;
            for (var i = 0; i < d.length; i += 4) {
                d[i] = d[i + 1] = d[i + 2] = 255;
                d[i + 3] = Math.abs(255 - d[i + 3]);
            }
            ctx.clearRect(0, 0, img.width, img.height);
            ctx.putImageData(data, 0, 0);
            resolve(c.toBuffer("image/png"));
        });
    });
};
