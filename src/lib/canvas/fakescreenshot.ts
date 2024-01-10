import { createCanvas, loadImage } from "canvas";

export default (username: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        var c = createCanvas(676, 150);
        var ctx = c.getContext("2d");

        let img = await loadImage("images/emptyredditcomment.png");
        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = "white";
        ctx.font = '12px "IBM Plex Sans"';
        ctx.fillText("text here", 59, 98);

        resolve(c.toBuffer("image/png"));
    });
};
