import { createCanvas } from "canvas";

const SEGMENTS = [
    ["Social\nDifficulty", "#6bb838", "#9fd37b"],
    ["Anxiety", "#acc96e", "#cee1a5"],
    ["Abnormal\nPosture", "#f0cb3a", "#fde684"],
    ["Poor Eye\nContact", "#e57328", "#fdb788"],
    ["Tics and\nFidgets", "#c01515", "#ea8d8d"],
    ["Aggression", "#c50b9f", "#fb91e5"],
    ["Depression", "#422073", "#b19ccf"],
    ["Fixations", "#29298f", "#9d9edf"],
    ["Abnormal/\nFlat Speech", "#0785a5", "#84d3e7"],
    ["Noise\nSensitivity", "#2c8472", "#8fcabf"],
];

export default async function autism(values: number[]) {
    let w = 732,
        h = 600;
    let radius = 250;
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    for (let i = 0; i < SEGMENTS.length; i++) {
        const value = values[i] ?? Math.random();
        const segment = SEGMENTS[i];
        let grad = ctx.createRadialGradient(
            w / 2,
            h / 2,
            0,
            w / 2,
            h / 2,
            radius * value
        );
        grad.addColorStop(0, segment[2]);
        grad.addColorStop(1, segment[1]);
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.arc(
            w / 2,
            h / 2,
            radius * value,
            (i / SEGMENTS.length) * Math.PI * 2 - Math.PI * 0.5,
            ((i + 1) / SEGMENTS.length) * Math.PI * 2 - Math.PI * 0.5
        );
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
    }
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - (radius / 5) * i);
        ctx.arc(w / 2, h / 2, (radius / 5) * i, -Math.PI * 0.5, Math.PI * 1.5);
        ctx.closePath();
        ctx.stroke();
    }
    for (let i = 0; i < SEGMENTS.length; i++) {
        let theta = ((Math.PI * 2) / SEGMENTS.length) * i - Math.PI * 0.5;
        let x = Math.cos(theta) * radius + w / 2;
        let y = Math.sin(theta) * radius + h / 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    ctx.fillStyle = "black";
    ctx.font = "bold 24px 'Open Sans', sans-serif";
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI * 0.5);
    for (let i = 0; i < SEGMENTS.length; i++) {
        let segment = SEGMENTS[i];
        let lines = segment[0].split("\n");
        let reverse = false;
        ctx.save();
        if (i / SEGMENTS.length > 0.5) {
            reverse = true;
            ctx.rotate(Math.PI);
        } else {
            lines.reverse();
        }
        let y = -radius - 10 - (reverse ? 15 : 0);
        let index = 0;
        let lineShrinkFactor = 2;
        for (const line of lines) {
            let width = ctx.measureText(line).width;
            let angle =
                (width - index * lineShrinkFactor * line.length) / radius;
            ctx.save();
            ctx.rotate((-angle / 2) * (reverse ? -1 : 1));
            for (const char of line) {
                ctx.fillText(char, 0, y * (reverse ? -1 : 1));
                ctx.rotate(
                    ((ctx.measureText(char).width - index * lineShrinkFactor) /
                        radius) *
                        (reverse ? -1 : 1)
                );
            }
            ctx.restore();
            index++;
            y -= ctx.measureText(line).actualBoundingBoxAscent + 5;
        }
        ctx.restore();
        ctx.rotate((Math.PI * 2) / SEGMENTS.length);
    }
    ctx.restore();
    return c.toBuffer();
}
