import puppeteer, { Browser, Page } from "puppeteer";
import { Web3DAnimation } from "../types";

let browser: Browser | null = null;
let page: Page | null = null;

let minimalArgs = [
    "--autoplay-policy=user-gesture-required",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-domain-reliability",
    "--disable-extensions",
    "--disable-features=AudioServiceOutOfProcess",
    "--disable-hang-monitor",
    "--disable-ipc-flooding-protection",
    "--disable-notifications",
    "--disable-offer-store-unmasked-wallet-cards",
    "--disable-popup-blocking",
    "--disable-print-preview",
    "--disable-prompt-on-repost",
    "--disable-renderer-backgrounding",
    "--disable-setuid-sandbox",
    "--disable-speech-api",
    "--disable-sync",
    "--hide-scrollbars",
    "--ignore-gpu-blacklist",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-pings",
    "--no-sandbox",
    "--no-zygote",
    "--password-store=basic",
    "--use-gl=swiftshader",
    "--use-mock-keychain",
];

export async function flapsWeb3DAPIInit(): Promise<void> {
    return new Promise(async (res, rej) => {
        try {
            browser = await puppeteer.launch({
                //@ts-ignore
                headless: "new",
                args: [...minimalArgs],
            });
            page = await browser.newPage();
            res();
        } catch (e) {
            rej(e);
        }
    });
}

export async function getWeb3DAPIImage(
    id: string,
    options: Record<string, any>
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        if (!browser || !page) return rej("Please initialize");
        await page.goto(
            "http://localhost:" +
                (process.env.WEB_PORT || 8080) +
                "/web3d/view_web3d"
        );
        await page.removeExposedFunction("flapsWeb3DFinished").catch(() => {});
        await page.exposeFunction(
            "flapsWeb3DFinished",
            async (width: number, height: number) => {
                await page.setViewport({ width, height });
                let buffer = await page.screenshot({
                    encoding: "binary",
                    type: "jpeg",
                });
                if (buffer instanceof Buffer) {
                    res(buffer);
                } else {
                    rej("page.screenshot did not return a Buffer.");
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

export async function hookWeb3DAPIAnimation(
    id: string,
    options: Record<string, any>
): Promise<Web3DAnimation> {
    return new Promise(async (res, rej) => {
        if (!browser || !page) return rej("Please initialize");
        await page.goto(
            "http://localhost:" +
                (process.env.WEB_PORT || 8080) +
                "/web3d/view_web3d"
        );
        let currentStepPromise: Promise<Buffer> | null;
        let currentStepPromiseResolve: (value: Buffer) => void;
        await page.removeExposedFunction("flapsWeb3DFinished").catch(() => {});
        await page.exposeFunction(
            "flapsWeb3DFinished",
            async (width: number, height: number) => {
                await page.setViewport({ width, height });
                let buffer = await page.screenshot({ encoding: "binary" });
                if (buffer instanceof Buffer) {
                    let animation: Web3DAnimation = {
                        lastFrame: buffer,
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
                    };
                    res(animation);
                } else {
                    rej("page.screenshot did not return a Buffer.");
                }
            }
        );
        await page
            .removeExposedFunction("flapsWeb3DStepFinished")
            .catch(() => {});
        await page.exposeFunction(
            "flapsWeb3DStepFinished",
            async (width: number, height: number) => {
                if (currentStepPromise) {
                    await page.setViewport({ width, height });
                    let buffer = await page.screenshot({
                        encoding: "binary",
                        type: "jpeg",
                    });
                    if (buffer instanceof Buffer) {
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
