import { StableDiffusionOptions } from "../../types";
import createCollage from "../canvas/createCollage";
import invertAlpha from "../canvas/invertAlpha";
import make512x512 from "../canvas/make512x512";
import fetch from "node-fetch";
import { readFile } from "fs/promises";
import { file } from "../ffmpeg/ffmpeg";

export default (data: StableDiffusionOptions, big = false): Promise<Buffer> => {
    return new Promise(async (resl, rej) => {
        if (data.prompt == "europan leaked documents") {
            setTimeout(async () => {
                resl(
                    await createCollage(
                        new Array(4).fill(await readFile(file("europan.png")))
                    )
                );
            }, 10000);
            return;
        }
        if (data.img2img) big = true;
        var size = big ? 1024 : 512;
        if (data.img) size = 512;
        var body = {
            num_images: big ? 1 : 4,
            width: size,
            height: size,
            prompt: data.prompt,
            modelType: "stable-diffusion",
            isPrivate: true,
            batchId: Math.floor(Math.random() * 1e7).toString(36),
            generateVariants: false,
            cfg_scale: 7,
            steps: big ? 50 : 25,
            seed: Math.floor(Math.random() * 1e7),
            sampler: 3,
        };
        if (data.inpaint && data.mask && data.img) {
            Object.assign(body, {
                start_schedule: 0.7,
                mask_strength: 0.5,
                mode: 1,
                mask_image:
                    "data:image/png;base64," +
                    (
                        await invertAlpha(
                            await make512x512(
                                Buffer.from(data.mask.split(",")[1], "base64")
                            )
                        )
                    ).toString("base64"),
                init_image:
                    "data:image/png;base64," +
                    (
                        await make512x512(
                            Buffer.from(data.img.split(",")[1], "base64")
                        )
                    ).toString("base64"),
            });
        } else if (data.img2img && data.img) {
            Object.assign(body, {
                start_schedule: 0.7,
                mask_strength: 0.7,
                filter: "none",
                hide: true,
                init_image:
                    "data:image/png;base64," +
                    (
                        await make512x512(
                            Buffer.from(data.img.split(",")[1], "base64")
                        )
                    ).toString("base64"),
                mode: 2,
                strength: 1.3,
                cfg_scale: 4,
            });
        }

        fetch("https://playgroundai.com/api/models", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
                Accept: "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Sec-GPC": "1",
                cookie: process.env.PLAYGROUND_COOKIE,
            },
            body: JSON.stringify(body),
            method: "POST",
        })
            .then((resp) => resp.text())
            .then(async (res3) => {
                try {
                    var res = JSON.parse(res3);
                    if (!res.images) {
                        rej(res3);
                    }
                    if (big) {
                        resl(
                            Buffer.from(
                                res.images[0].url.split(",")[1],
                                "base64"
                            )
                        );
                    } else {
                        //res.images[0].url.split(",")[1];
                        var imgs = res.images.map((img) =>
                            Buffer.from(img.url.split(",")[1], "base64")
                        );
                        createCollage(imgs).then((collage) => {
                            resl(collage);
                        });
                    }
                } catch (e) {
                    rej(e + "\n" + res3);
                }
            })
            .catch((err) => {
                rej(err.toString());
            });
    });
};
