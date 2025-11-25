import puppeteer, { Browser, Page } from "puppeteer";
import { Web3DAnimation } from "../types";
import { dataURLToBuffer } from "./utils";
import { resolve } from "dns";
import { addBufferSequence, removeBuffer } from "..";
import { ffmpegBuffer } from "./ffmpeg/ffmpeg";

let minimalArgs = [];
let headless: boolean | "shell" = process.env.WEB3D_HEADLESS == "yes";

export async function trackReport(trackFile: string): Promise<Buffer> {
    return new Promise<Buffer>(async (res, rej) => {
        let browser = await puppeteer.launch({
            headless,
            args: [...minimalArgs],
            defaultViewport: null,
        });
        let page = await browser.newPage();
        await page.setViewport({
            width: 1440,
            height: 1080,
        });
        await page.goto(
            "http://localhost:" + (process.env.WEB_PORT || 8080) + "/trackgraph"
        );
        await page.evaluate((trackFile) => {
            //@ts-ignore
            window.init(trackFile);
        }, trackFile);
        await page.waitForSelector("div#data-done-marker");
        const dataElement = await page.waitForSelector("div#data");
        let buffer = await dataElement.screenshot({
            encoding: "binary",
            type: "jpeg",
        });
        buffer = Buffer.from(buffer);
        if (buffer instanceof Buffer) {
            res(buffer);
        } else {
            rej("dataElement.screenshot did not return a Buffer.");
        }
        browser.close();
    });
}

export async function gpu(): Promise<Buffer> {
    return new Promise<Buffer>(async (res, rej) => {
        let browser = await puppeteer.launch({
            headless,
            args: [...minimalArgs],
        });
        let page = await browser.newPage();
        await page.goto("chrome://gpu");
        let buffer = await page.screenshot({
            encoding: "binary",
            type: "jpeg",
        });
        buffer = Buffer.from(buffer);
        if (buffer instanceof Buffer) {
            res(buffer);
        } else {
            rej("page.screenshot did not return a Buffer.");
        }
        browser.close();
    });
}

export async function getWeb3DAPIImage(
    id: string,
    options: Record<string, any>
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        let browser = await puppeteer.launch({
            headless,
            args: [...minimalArgs],
        });
        let page = await browser.newPage();
        await page.goto(
            "http://localhost:" +
                (process.env.WEB_PORT || 8080) +
                "/web3d/view_web3d"
        );
        await page.removeExposedFunction("flapsWeb3DFinished").catch(() => {});
        await page.exposeFunction("flapsWeb3DFinished", async (url: string) => {
            let buffer = dataURLToBuffer(url);
            if (buffer instanceof Buffer) {
                res(buffer);
            } else {
                rej("page.screenshot did not return a Buffer.");
            }
            browser.close();
        });
        await page.evaluate(
            (id, options) => {
                //@ts-ignore
                window.flapsWeb3DInit(id, options);
            },
            id,
            options
        );
    });
}

export async function hookWeb3DAPIAnimation(
    id: string,
    options: Record<string, any>
): Promise<Web3DAnimation> {
    return new Promise(async (res, rej) => {
        let browser = await puppeteer.launch({
            headless,
            args: [...minimalArgs],
        });
        let page = await browser.newPage();
        await page.goto(
            "http://localhost:" +
                (process.env.WEB_PORT || 8080) +
                "/web3d/view_web3d",
            { waitUntil: "domcontentloaded" }
        );
        let lastFrame: Buffer;
        let currentStepPromise: Promise<Buffer> | null;
        let currentStepPromiseResolve: (value: Buffer) => void;
        await page.removeExposedFunction("flapsWeb3DFinished").catch(() => {});
        await page.exposeFunction("flapsWeb3DFinished", async (url: string) => {
            let buffer = dataURLToBuffer(url);
            if (buffer instanceof Buffer) {
                lastFrame = buffer;
                let animation: Web3DAnimation = {
                    lastFrame: () => {
                        return lastFrame;
                    },
                    step: async (...args): Promise<Buffer> => {
                        currentStepPromise = new Promise<Buffer>(
                            async (resolve, reject) => {
                                currentStepPromiseResolve = resolve;
                            }
                        );
                        page.evaluate((args) => {
                            //@ts-ignore
                            window.flapsWeb3DStep(...(args || []));
                        }, args);
                        return currentStepPromise;
                    },
                    destroy: () => {
                        browser.close();
                    },
                };
                res(animation);
            } else {
                rej("page.screenshot did not return a Buffer.");
            }
        });
        await page
            .removeExposedFunction("flapsWeb3DStepFinished")
            .catch(() => {});
        await page.exposeFunction(
            "flapsWeb3DStepFinished",
            async (url: string) => {
                if (currentStepPromise) {
                    let buffer = dataURLToBuffer(url);
                    if (buffer instanceof Buffer) {
                        lastFrame = buffer;
                        currentStepPromiseResolve(buffer);
                    } else {
                        rej("page.screenshot did not return a Buffer.");
                    }
                }
            }
        );
        await page.evaluate(
            (id, options) => {
                //@ts-ignore
                window.flapsWeb3DInit(id, options);
            },
            id,
            options
        );
    });
}

export async function animate(
    id: string,
    durationFrames: number,
    framerate: number,
    options: Record<string, any>
) {
    let animation = await hookWeb3DAPIAnimation(id, options);
    let animationFrames: Buffer[] = [];
    for (let i = 0; i < durationFrames; i++) {
        animationFrames.push(await animation.step(i / durationFrames));
    }
    animation.destroy();
    let animationSequence = addBufferSequence(animationFrames, "png");
    let animationConcat = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -r ${framerate} -i http://localhost:56033/${animationSequence} -r ${framerate} $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(animationSequence);
    return animationConcat;
}
