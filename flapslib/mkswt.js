const { uuidv4 } = require("./ai");
const { sendWebhook, sendWebhookFile } = require("./webhooks");
const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { complexFFmpeg } = require("./video");

var puppeteerInitialized = false;
var aiPageData = {};
var waitCounts = 0;

async function init() {
    aiPageData.browser = await puppeteer.launch();
    aiPageData.page = await aiPageData.browser.newPage();
    await aiPageData.page.goto("about:blank");
    aiPageData.page.on('console', async(msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
        }
    });
    await aiPageData.page.evaluate(() => {
        window.sleep = ms => new Promise(r => setTimeout(r, ms));
    });
    puppeteerInitialized = true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

init();

async function makesweet(text, filename, msgChannel, client, send = true) {
    return new Promise((resolve, reject) => {
        try {
            if (!puppeteerInitialized) {
                return sendWebhook("mkswt", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
            }
            (async() => {
                sendWebhook("mkswt", "setting stuff up", false, msgChannel);
                await aiPageData.page.goto("https://makesweet.com/my/heart-locket");
                await aiPageData.page.evaluate(() => {
                    window.sleep = ms => new Promise(r => setTimeout(r, ms));
                });
                await aiPageData.page.evaluate(() => {
                    document.querySelector("#add_text").click();
                });
                await sleep(250);
                await aiPageData.page.evaluate((t) => {
                    document.querySelector(".textbar_text").value = t;
                    const event = new Event('keyup');
                    document.querySelector(".textbar_text").dispatchEvent(event);
                }, text);
                await sleep(250);
                await aiPageData.page.evaluate(() => {
                    document.querySelector(".ok_text").click();
                });
                await sleep(250);
                await aiPageData.page.evaluate(() => {
                    document.querySelector("#wb-add > a:nth-child(1)").click();
                });
                await sleep(250);
                const [fileChooser] = await Promise.all([
                    aiPageData.page.waitForFileChooser(),
                    aiPageData.page.evaluate(() => {
                        document.querySelector('#files').click();
                    })
                ]);
                await sleep(250);
                await fileChooser.accept([path.join(__dirname, "..", "images", "cache", filename)]);
                await aiPageData.page.evaluate(async() => {
                    document.querySelector("#wb-animate > a:nth-child(1)").click();
                    await sleep(250);
                    document.querySelector("#wb-make-gif > a:nth-child(1)").click();
                });
                sendWebhook("mkswt", "and we're off!", false, msgChannel);

                var originalSrc = '';
                waitInterval = setInterval(async() => {
                    waitCounts++;
                    var url = await aiPageData.page.evaluate((original) => {
                        if (original == document.querySelector("#result_preview").src) {
                            return false;
                        } else return document.querySelector("#result_preview").src;
                    }, originalSrc);
                    console.log("Waiting...");
                    if (url !== false) {
                        console.log("DONE!!!!");
                        sendWebhook("mkswt", "i say, i say, we're done!", false, msgChannel);
                        await aiPageData.page.evaluate((url) => {
                            window.open(url);
                        }, url);
                        const newTarget = await aiPageData.page.browserContext().waitForTarget(
                            target => target.url().startsWith('blob:')
                        );
                        const newPage = await newTarget.page();
                        const blobUrl = newPage.url();
                        var outputFilename = './images/cache/' + uuidv4() + ".gif";
                        aiPageData.page.once('response', async(response) => {
                            console.log(response.url());
                            const img = await response.buffer();
                            fs.writeFileSync(outputFilename, img);
                            if (send) {
                                /**
                                 * @type {Discord.Message}
                                 */
                                var message = await client.channels.cache.get("956316856422137856").send({
                                    files: [{
                                        attachment: outputFilename
                                    }]
                                });

                                setTimeout(() => {
                                    fs.unlinkSync(outputFilename);
                                }, 10000);

                                sendWebhook("mkswt", message.attachments.first().url, false, msgChannel);
                            }
                            await aiPageData.page.goto("https://makesweet.com/my/heart-locket");
                            newPage.close();
                            resolve(outputFilename);
                        });
                        await aiPageData.page.evaluate((url) => { fetch(url); }, blobUrl);
                        clearInterval(waitInterval);
                        waitCounts = 0;
                    }
                    if (waitCounts == 40) {
                        waitCounts = 0;
                        clearInterval(waitInterval);
                        return sendWebhook("mkswt", "Loop detected (took more than 40 seconds)", false, msgChannel);
                    }
                }, 1000);
            })();

        } catch (e) {
            console.log("aw");
            console.log(e);
        }
    });
}

function reverseMakesweet(text, filename, msgChannel) {
    makesweet(text, filename, msgChannel, null, false).then(outputFilename => {
        var newId = uuidv4() + ".gif";
        complexFFmpeg(outputFilename, `./images/cache/` + newId, {
            args: `-lavfi "[0:v]palettegen[p];[0:v]reverse[outx];[outx][p]paletteuse[outf]" -map "[outf]"`
        }).then(async() => {
            sendWebhookFile("mkswt", "images/cache/" + newId, false, msgChannel);
        });
    });
}

module.exports = {
    makesweet: makesweet,
    reverseMakesweet: reverseMakesweet
};