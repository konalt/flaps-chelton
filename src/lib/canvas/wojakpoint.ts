import { loadImage, createCanvas } from "canvas";

function calculateWojakWidth(
    originalWidth: number,
    originalHeight: number,
    setHeight: number
): number {
    return originalWidth * (setHeight / originalHeight);
}

export default (buf: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        if (!buf) return reject("An image buffer is required");
        let wojakleft = await loadImage("images/wojak_left.png");
        let wojakright = await loadImage("images/wojak_right.png");
        let image = await loadImage(buf);
        var c = createCanvas(image.width, image.height);
        var ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0);
        let f = image.height * 0.85;
        let leftWojakDimensions = [
            calculateWojakWidth(wojakleft.width, wojakleft.height, f),
            f,
        ];
        let rightWojakDimensions = [
            calculateWojakWidth(wojakright.width, wojakright.height, f),
            f,
        ];
        ctx.drawImage(
            wojakleft,
            0,
            image.height - leftWojakDimensions[1],
            leftWojakDimensions[0],
            leftWojakDimensions[1]
        );
        ctx.drawImage(
            wojakright,
            image.width - rightWojakDimensions[0],
            image.height - rightWojakDimensions[1],
            rightWojakDimensions[0],
            rightWojakDimensions[1]
        );
        resolve(c.toBuffer("image/png"));
    });
};
