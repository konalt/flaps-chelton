import { readFileSync } from "node:fs";
import { file } from "../ffmpeg/ffmpeg";
import { CharTemplate } from "../../types";
import { createCanvas, loadImage } from "canvas";
import { degToRad } from "../utils";

async function createTemplates(data: string[]) {
    let templates: Record<string, CharTemplate> = {};
    let currentTemplate = "";
    for (const lineText of data) {
        if (lineText.startsWith("#")) {
            let split = lineText.split(" ");
            currentTemplate = split[0].substring(1);

            let hasBottom = split[1].includes("0");
            let hasTop = split[1].includes("1");
            let width = 512;
            let height = 512;

            let bottom = null;
            let top = null;

            if (hasBottom) {
                bottom = await loadImage(
                    file(`chartemplates/${currentTemplate}_0.png`)
                );
                width = bottom.width;
                height = bottom.height;
            }
            if (hasTop) {
                top = await loadImage(
                    file(`chartemplates/${currentTemplate}_1.png`)
                );
                width = top.width;
                height = top.height;
            }

            templates[currentTemplate] = {
                bottom,
                top,
                images: [],
                width,
                height,
            };
        } else {
            templates[currentTemplate].images.push(
                lineText.split(" ").map((n) => parseFloat(n)) as [
                    number,
                    number,
                    number,
                    number,
                    number?
                ]
            );
        }
    }

    return templates;
}

export let templates: Record<string, CharTemplate> | { _i: true } = {
    _i: true,
};

export async function reload() {
    templates = await createTemplates(
        readFileSync(file("chartemplates/templates.dat"), "utf8")
            .split("\n")
            .map((n) => n.trim())
    );
}

export async function char(templateId: string, buffer: Buffer) {
    if (templates._i || templateId == "reload") {
        await reload();
        if (templateId == "reload") {
            const c = createCanvas(500, 100);
            const ctx = c.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 500, 100);
            ctx.fillStyle = "black";
            ctx.font = "90px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Reloaded templates!", 250, 50, 490);
            return c.toBuffer();
        }
    }
    if (!templates[templateId]) return buffer;
    const template = templates[templateId];

    const img = await loadImage(buffer);
    const c = createCanvas(template.width, template.height);
    const ctx = c.getContext("2d");

    if (template.bottom)
        ctx.drawImage(template.bottom, 0, 0, template.width, template.height);

    for (const imageCoords of template.images) {
        if (imageCoords[4]) {
            ctx.save();
            ctx.translate(imageCoords[0], imageCoords[1]);
            ctx.rotate(degToRad(imageCoords[4]));
            ctx.drawImage(
                img,
                -imageCoords[2] / 2,
                -imageCoords[3] / 2,
                imageCoords[2],
                imageCoords[3]
            );
            ctx.restore();
        } else {
            ctx.drawImage(img, ...imageCoords);
        }
    }
    if (template.top)
        ctx.drawImage(template.top, 0, 0, template.width, template.height);
    return c.toBuffer();
}
