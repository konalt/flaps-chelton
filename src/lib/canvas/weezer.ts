import { createCanvas, loadImage } from "canvas";

export default async (): Promise<Buffer> => {
    const s = 552;
    let c = createCanvas(s, s);
    let ctx = c.getContext("2d");
    ctx.fillStyle = `#189BCC`;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i <= 3; i++) {
        if (Math.random() < 0.5) continue;
        let weez = await loadImage(
            `images/weezer${Math.ceil(Math.random() * 4)}.png`
        );
        let height = weez.height * (Math.random() * 0.8 + 0.5);
        ctx.drawImage(
            weez,
            (s / 4) * (i + 0.5) - weez.width / 2,
            s - height + 10,
            weez.width,
            height
        );
    }
    ctx.font = "bold 48px Weezer";
    ctx.fillStyle = "black";
    ctx.textBaseline = "bottom";
    ctx.fillText("weezer", 0, 48);
    return c.toBuffer();
};
