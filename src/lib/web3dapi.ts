import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | null = null;
let page: Page | null = null;

export async function flapsWeb3DAPIInit(): Promise<void> {
    return new Promise(async (res, rej) => {
        try {
            browser = await puppeteer.launch({
                //@ts-ignore
                headless: "new",
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
                let buffer = await page.screenshot({ encoding: "binary" });
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
