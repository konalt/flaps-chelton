const puppeteer = require("puppeteer");
const download = require("./download");
const { sendWebhook } = require("./webhooks");
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { sentence } = require("txtgen/dist/cjs/txtgen");
const MarkovTextGenerator = require("markov-text-generator").default;

var lastRequests = {};
var waitInterval = 0;
var waitCounts = 0;
var puppeteerInitialized = false;
var aiPageData = {};

const getRandomValues = require("get-random-values");

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function textgen(channel) {
    sendWebhook("deepai", sentence(), false, channel);
}

async function init() {
    aiPageData.browser = await puppeteer.launch();
    aiPageData.page = await aiPageData.browser.newPage();
    await aiPageData.page.goto("https://deepai.org/machine-learning-model/text-generator");
    aiPageData.page.on('console', async(msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
        }
    });
    puppeteerInitialized = true;
}

function decodeEntities(encodedString) {
    return encodedString.replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ");
}

async function autocompleteText(text, msgChannel, removeOriginalText = false) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook("deepai", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
        }
        (async() => {
            await aiPageData.page.goto("https://deepai.org/machine-learning-model/text-generator");
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(".model-input-row > button:nth-child(2)");

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (original == document.querySelector(".try-it-result-area").innerHTML) {
                        return false;
                    } else return document.querySelector(".try-it-result-area").innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<div style="width: 100%; height: 100%; overflow: auto; display: flex; align-items: center; flex-direction: column;"><pre style="white-space: pre-wrap; margin: 0px;">'.length);
                    a2 = a2.substring(0, a2.length - '</pre></div>'.length);
                    a2 = decodeEntities(a2);
                    if (removeOriginalText) a2 = a2.substring(text.length + 6);
                    //console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    sendWebhook("deepai", a2, false, msgChannel);
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook("deepai", "Loop detected (took more than 20 seconds)", false, msgChannel);
                }
            }, 1000);
        })();

    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

async function markov(text, msgChannel) {
    var m = new MarkovTextGenerator(1, {
        startAsSentence: false,
        endAsSentence: false,
        filterFunction: word => word.indexOf("http") === -1
    });
    m.setTrainingText((text.split(" ").length < 10) ? shuffle(text.repeat(5).split(" ")).join(" ") : text);
    var a = m.generateText(1000);
    sendWebhook("deepai", a, false, msgChannel);
}
async function markov2(text, acc, msgChannel) {
    try {
        fetch("https://projects.haykranen.nl/markov/demo/", {
            "credentials": "omit",
            "headers": {
                "User-Agent": "FlapsChelton",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/x-www-form-urlencoded",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1"
            },
            "referrer": "https://projects.haykranen.nl/markov/demo/",
            "body": "input=" + encodeURIComponent(text) + "&text=&order=4&length=2500&submit=GO",
            "method": "POST",
            "mode": "cors"
        }).then(r => r.text()).then((resp) => {
            var content = resp.replace(/[\t] +/gi, "").substring(12293, 12293 + (resp.replace(/[\t] +/gi, "").length - 18500));
            if (content.length > 1500) {
                content = content.substring(0, 1500);
            }
            console.log(content);
            sendWebhook("deepai", content, false, msgChannel);
        });
    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}
async function armstrong(msgChannel) {
    var text = fs.readFileSync("./armstrong.txt").toString();
    try {
        if (!puppeteerInitialized) {
            return sendWebhook("deepai", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
        }
        (async() => {
            await aiPageData.page.goto("https://deepai.org/machine-learning-model/text-generator");
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(".model-input-row > button:nth-child(2)");

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (original == document.querySelector(".try-it-result-area").innerHTML) {
                        return false;
                    } else return document.querySelector(".try-it-result-area").innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<div style="width: 100%; height: 100%; overflow: auto; display: flex; align-items: center; flex-direction: column;"><pre style="white-space: pre-wrap; margin: 0px;">'.length);
                    a2 = a2.substring(0, a2.length - '</pre></div>'.length);
                    a2 = decodeEntities(a2);
                    //console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    sendWebhook("deepai", a2, false, msgChannel);
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook("deepai", "Loop detected (took more than 20 seconds)", false, msgChannel);
                }
            }, 1000);
        })();

    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}
async function armstrong2(accuracy, msgChannel) {
    try {
        fetch("https://projects.haykranen.nl/markov/demo/", {
            "credentials": "omit",
            "headers": {
                "User-Agent": "FlapsChelton",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/x-www-form-urlencoded",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1"
            },
            "referrer": "https://projects.haykranen.nl/markov/demo/",
            "body": "input=" + fs.readFileSync(
                "./armstrong.txt"
            ).toString() + "&text=&order=" + accuracy + "&length=1000&submit=GO",
            "method": "POST",
            "mode": "cors"
        }).then(r => r.text()).then((resp) => {
            var content = resp.replace(/[\t] +/gi, "").replace(/&hellip;/gi, "...").replace(/&rsquo;/gi, "'").substring(12293, 12293 + (resp.replace(/[\t] +/gi, "").length - 18500));
            if (content.length > 1500) {
                content = content.substring(0, 1500);
            }
            console.log(content);
            sendWebhook("armstrong", content, false, msgChannel);
        });
    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}

async function threeDimensionalTextLayer2(text, msgChannel, msg, imageName, client) {
    await aiPageData.page.goto("https://konalt.us.to/flaps/3dtext/?text=" + encodeURIComponent(text) + (msg.attachments.first() ? "&imageurl=" + encodeURIComponent("https://konalt.us.to/flaps/image_urls/" + imageName) : ""));
    waitInterval = setInterval(async() => {
        waitCounts++;
        var a = await aiPageData.page.evaluate((c) => {
            console.log(document.querySelector("html").innerHTML);
            var element = document.querySelector("canvas");
            console.log(element);
            return (typeof(element) != 'undefined' && element != null);
        });
        console.log("Waiting...");
        if (a) {
            clearInterval(waitInterval);
            waitCounts = 0;
            var imgID2 = uuidv4().replace(/-/gi, "");
            var imagePath = path.join(__dirname, '../images/cache/', imgID2 + '.jpg');
            await aiPageData.page.screenshot({ path: imagePath });
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: imagePath
                }]
            });
            setTimeout(() => {
                fs.unlinkSync(imagePath);
            }, 10000);
            sendWebhook("deepai", message.attachments.first().url, false, msgChannel);
        }
        if (waitCounts == 20) {
            waitCounts = 0;
            clearInterval(waitInterval);
            return sendWebhook("deepai", "Loop detected (took more than 20 seconds)", false, msgChannel);
        }
    }, 1000);
}

async function person(msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook("deepai", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
        }
        var imgID2 = uuidv4().replace(/-/gi, "");
        var imagePath = path.join(__dirname, '../images/cache/', imgID2 + '.jpg');
        fs.writeFileSync(imagePath, "");
        download("https://thispersondoesnotexist.com/image", imagePath, async(err) => {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: imagePath
                }]
            });

            setTimeout(() => {
                fs.unlinkSync(imagePath);
            }, 10000);

            sendWebhook("deepai", message.attachments.first().url, false, msgChannel);
        });
    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}

async function threeDimensionalText(text, msgChannel, msg, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook("deepai", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
        }
        (async() => {
            var imgID2 = uuidv4().replace(/-/gi, "");
            if (msg.attachments.first()) {
                download(msg.attachments.first().url, "../2site/sites/konalt/flaps/image_urls/" + imgID2 + msg.attachments.first().url.split(".")[msg.attachments.first().url.split(".").length - 1], () => {
                    threeDimensionalTextLayer2(text, msgChannel, msg, (msg.attachments.first() ? imgID2 + msg.attachments.first().url.split(".")[msg.attachments.first().url.split(".").length - 1] : null), client);
                });
            } else {
                threeDimensionalTextLayer2(text, msgChannel, msg, null, client);
            }
        })();

    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}

async function generateImage(text, msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook("deepai", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
        }
        (async() => {
            await aiPageData.page.goto("https://deepai.org/machine-learning-model/text2img");
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(".model-input-row > button:nth-child(2)");

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (original == document.querySelector(".try-it-result-area").innerHTML) {
                        return false;
                    } else return document.querySelector(".try-it-result-area").innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<img src="'.length);
                    a2 = a2.substring(0, a2.length - '" style="position: relative; width: 100%; height: 100%; object-fit: contain;">'.length);
                    console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    var imgID2 = uuidv4().replace(/-/gi, "");
                    var imagePath = path.join(__dirname, '../images/cache/', imgID2 + '.jpg');
                    fs.writeFileSync(imagePath, "");
                    download(a2, imagePath, async(err) => {
                        if (err) return sendWebhook("deepai", err, false, msgChannel);
                        /**
                         * @type {Discord.Message}
                         */
                        var message = await client.channels.cache.get("956316856422137856").send({
                            files: [{
                                attachment: imagePath
                            }]
                        });

                        setTimeout(() => {
                            fs.unlinkSync(imagePath);
                        }, 10000);

                        sendWebhook("deepai", message.attachments.first().url, false, msgChannel);
                    });
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook("deepai", "Loop detected (took more than 20 seconds)", false, msgChannel);
                }
            }, 1000);
        })();

    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}

async function upscaleImage(msg, msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook("deepai", "Puppeteer not initialized. Wait a few seconds.", false, msgChannel);
        }
        (async() => {
            await aiPageData.page.goto("https://deepai.org/machine-learning-model/waifu2x");
            await aiPageData.page.evaluate((t) => {
                window.switchToUrlUpload();
                document.querySelector("#url-input-image").value = t;
                window.autoSubmit();
            }, msg.attachments.first().url);

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                if (document.querySelector(".try-it-result-area > img:nth-child(1)").src.includes("waifu2x")) {
                    return '<img src="https://api.deepai.org/job-view-file/aea88859-1ed9-4fa9-9a1d-b571b1dc22ed/outputs/output.png" style="position: relative; width: 100%; height: 100%; object-fit: contain;">';
                }
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (original == document.querySelector(".try-it-result-area").innerHTML) {
                        return false;
                    } else return document.querySelector(".try-it-result-area").innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<img src="'.length);
                    a2 = a2.substring(0, a2.length - '" style="position: relative; width: 100%; height: 100%; object-fit: contain;">'.length);
                    console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    var imgID2 = uuidv4().replace(/-/gi, "");
                    var imagePath = path.join(__dirname, '../images/cache/', imgID2 + '.jpg');
                    fs.writeFileSync(imagePath, "");
                    download(a2, imagePath, async(err) => {
                        if (err) return sendWebhook("deepai", err, false, msgChannel);
                        /**
                         * @type {Discord.Message}
                         */
                        var message = await client.channels.cache.get("956316856422137856").send({
                            files: [{
                                attachment: imagePath
                            }]
                        });

                        setTimeout(() => {
                            fs.unlinkSync(imagePath);
                        }, 10000);

                        sendWebhook("deepai", message.attachments.first().url, false, msgChannel);
                    });
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook("deepai", "Loop detected (took more than 20 seconds)", false, msgChannel);
                }
            }, 1000);
        })();

    } catch (e) {
        console.log("aw");
        console.log(e);
    }
}

module.exports = {
    generateImage: generateImage,
    autocompleteText: autocompleteText,
    threeDimensionalText: threeDimensionalText,
    person: person,
    uuidv4: uuidv4,
    markov: markov,
    markov2: markov2,
    armstrong: armstrong2,
    armstrong2: armstrong,
    txtgen: textgen,
    upscaleImage: upscaleImage
};

init();