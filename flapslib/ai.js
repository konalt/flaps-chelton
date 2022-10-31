const puppeteer = require("puppeteer");
const download = require("./download");
const {
    sendWebhook,
    sendWebhookFile,
    editWebhookMsg,
    editWebhookFile,
    sendWebhookAttachment,
    sendWebhookBuffer,
} = require("./webhooks");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { sentence } = require("txtgen/dist/cjs/txtgen");
const MarkovTextGenerator = require("markov-text-generator").default;
const WomboDreamApi = require("wombo-dream-api");
const { randomBytes } = require("crypto");
var dream = WomboDreamApi.buildDefaultInstance();

var lastRequests = {};
var waitInterval = 0;
var waitCounts = 0;
var puppeteerInitialized = false;
var aiPageData = {};

const getRandomValues = require("get-random-values");
const { resolve } = require("path");

function textgen(channel) {
    sendWebhook("deepai", sentence(), false, channel);
}

async function init() {
    aiPageData.browser = await puppeteer.launch({ headless: true });
    aiPageData.page = await aiPageData.browser.newPage();
    await aiPageData.page.goto(
        "https://deepai.org/machine-learning-model/text-generator"
    );
    aiPageData.page.on("console", async(msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
        }
    });
    await aiPageData.page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
    });
    puppeteerInitialized = true;
}

function decodeEntities(encodedString) {
    return encodedString.replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ");
}

function doDream(msg) {
    var commandArgs = msg.content.split(" ");
    var commandArgString = commandArgs.slice(1).join(" ");
    var lastState = "pending 0";
    sendWebhook(
        "wombo",
        "Dreaming: " + commandArgString + "...\n0%",
        msg.channel
    ).then((msgid) => {
        dream
            .generatePicture(commandArgString, 32, (task) => {
                console.log(task.state, "stage", task.photo_url_list.length);
                if (
                    lastState !=
                    task.state + " " + task.photo_url_list.length
                ) {
                    lastState = task.state + " " + task.photo_url_list.length;
                    var maxLen = 16 + 1;
                    var curLen = task.photo_url_list.length;
                    var percent = Math.floor((curLen / maxLen) * 100);
                    var text =
                        "Dreaming: " +
                        commandArgString +
                        "...\n" +
                        percent +
                        "%";
                    editWebhookMsg(msgid, msg.channel, text);
                }
            })
            .then((task) => {
                var id = uuidv4() + ".jpg";
                download(task.result.final, "images/cache/" + id, async() => {
                    editWebhookFile(
                        msgid,
                        msg.channel,
                        "images/cache/" + id,
                        commandArgString
                    );
                });
            })
            .catch(() => {
                addError(new Error("Wombo Dream Task Failed"));
                editWebhookMsg(
                    msgid,
                    msg.channel,
                    "<:literally1984:942504581466824734>"
                );
            });
    });
}

async function autocompleteText(text, msgChannel, removeOriginalText = false) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            await aiPageData.page.goto(
                "https://deepai.org/machine-learning-model/text-generator"
            );
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(
                ".model-input-row > button:nth-child(2)"
            );

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (
                        original ==
                        document.querySelector(".try-it-result-area").innerHTML
                    ) {
                        return false;
                    } else
                        return document.querySelector(".try-it-result-area")
                            .innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring(
                        '<div style="width: 100%; height: 100%; overflow: auto; display: flex; align-items: center; flex-direction: column;"><pre style="white-space: pre-wrap; margin: 0px;">'
                        .length
                    );
                    if (a2.includes("Model demos are currently paused"))
                        return sendWebhook(
                            "deepai",
                            "Model demos are currently paused for free users."
                        );
                    a2 = a2.substring(0, a2.length - "</pre></div>".length);
                    a2 = decodeEntities(a2);
                    if (removeOriginalText) a2 = a2.substring(text.length + 6);
                    //console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    sendWebhook("deepai", a2, msgChannel);
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook(
                        "deepai",
                        "Loop detected (took more than 20 seconds)",
                        false,
                        msgChannel
                    );
                }
            }, 1000);
        })();
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

var isFirstNav = true;

async function gpt3complete_new(text, msgChannel, removeOriginalText = false) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            await aiPageData.page.goto("https://beta.openai.com/playground");
            var wi = setInterval(async() => {
                var x = await aiPageData.page.evaluate(() => {
                    return document.querySelector(
                        "#root > div.route-container > div > div.pg-root.page-body.full-width.flush > div > div.pg-body > div.pg-left > div.pg-content-body > div > div > div > div > div > div.DraftEditor-editorContainer > div > div > div > div > span"
                    );
                });
                if (!x || isFirstNav) {
                    if (isFirstNav) clearInterval(wi);
                    isFirstNav = false;
                    return;
                } else {
                    clearInterval(wi);
                    await aiPageData.page.evaluate((t) => {
                        document.querySelector(
                            "#root > div.route-container > div > div.pg-root.page-body.full-width.flush > div > div.pg-body > div.pg-left > div.pg-content-body > div > div > div > div > div > div.DraftEditor-editorContainer > div > div > div > div > span"
                        ).innerHTML = '<span data-text="true">' + t + "</span>";
                    }, text);
                    await aiPageData.page.click(
                        "#root > div.route-container > div > div.pg-root.page-body.full-width.flush > div > div.pg-body > div.pg-left > div.pg-content-footer > div.pg-footer-left > button.btn.btn-sm.btn-filled.btn-primary.pg-submit-btn"
                    );

                    var originalHTMLContent = await aiPageData.page.evaluate(
                        () => {
                            return document.querySelector(
                                "#root > div.route-container > div > div.pg-root.page-body.full-width.flush > div > div.pg-body > div.pg-left > div.pg-content-body > div > div > div > div > div > div.DraftEditor-editorContainer > div > div > div > div > span"
                            ).innerHTML;
                        }
                    );
                    waitInterval = setInterval(async() => {
                        waitCounts++;
                        var a = await aiPageData.page.evaluate((original) => {
                            if (
                                original ==
                                document.querySelector(
                                    "#root > div.route-container > div > div.pg-root.page-body.full-width.flush > div > div.pg-body > div.pg-left > div.pg-content-body > div > div > div > div > div > div.DraftEditor-editorContainer > div > div > div > div > span"
                                ).innerHTML
                            ) {
                                return false;
                            } else
                                return document.querySelector(
                                    "#root > div.route-container > div > div.pg-root.page-body.full-width.flush > div > div.pg-body > div.pg-left > div.pg-content-body > div > div > div > div > div > div.DraftEditor-editorContainer > div > div > div > div > span"
                                ).innerHTML;
                        }, originalHTMLContent);
                        console.log("Waiting...");
                        if (a !== false) {
                            waitCounts = 0;
                            sendWebhook("deepai", a, msgChannel);
                        }
                        if (waitCounts == 20) {
                            waitCounts = 0;
                            clearInterval(waitInterval);
                            return sendWebhook(
                                "deepai",
                                "Loop detected (took more than 20 seconds)",
                                false,
                                msgChannel
                            );
                        }
                    }, 1000);
                }
            }, 1000);
        })();
    } catch (e) {
        addError(e);
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

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}

async function markov(text, msgChannel) {
    var m = new MarkovTextGenerator(1, {
        startAsSentence: false,
        endAsSentence: false,
        filterFunction: (word) => word.indexOf("http") === -1,
    });
    m.setTrainingText(
        text.split(" ").length < 10 ?
        shuffle(text.repeat(5).split(" ")).join(" ") :
        text
    );
    var a = m.generateText(1000);
    sendWebhook("deepai", a, msgChannel);
}
async function markov2(text, acc, msgChannel) {
    try {
        fetch("https://projects.haykranen.nl/markov/demo/", {
                credentials: "omit",
                headers: {
                    "User-Agent": "FlapsChelton",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                },
                referrer: "https://projects.haykranen.nl/markov/demo/",
                body: "input=" +
                    encodeURIComponent(text) +
                    "&text=&order=4&length=2500&submit=GO",
                method: "POST",
                mode: "cors",
            })
            .then((r) => r.text())
            .then((resp) => {
                var content = resp
                    .replace(/[\t] +/gi, "")
                    .substring(
                        12293,
                        12293 + (resp.replace(/[\t] +/gi, "").length - 18500)
                    );
                if (content.length > 1500) {
                    content = content.substring(0, 1500);
                }
                console.log(content);
                sendWebhook("deepai", content, msgChannel);
            });
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}
async function armstrong(msgChannel) {
    var text = fs.readFileSync("./armstrong.txt").toString();
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            await aiPageData.page.goto(
                "https://deepai.org/machine-learning-model/text-generator"
            );
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(
                ".model-input-row > button:nth-child(2)"
            );

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (
                        original ==
                        document.querySelector(".try-it-result-area").innerHTML
                    ) {
                        return false;
                    } else
                        return document.querySelector(".try-it-result-area")
                            .innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring(
                        '<div style="width: 100%; height: 100%; overflow: auto; display: flex; align-items: center; flex-direction: column;"><pre style="white-space: pre-wrap; margin: 0px;">'
                        .length
                    );
                    a2 = a2.substring(0, a2.length - "</pre></div>".length);
                    a2 = decodeEntities(a2);
                    //console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    sendWebhook("deepai", a2, msgChannel);
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook(
                        "deepai",
                        "Loop detected (took more than 20 seconds)",
                        false,
                        msgChannel
                    );
                }
            }, 1000);
        })();
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}
async function armstrong2(accuracy, msgChannel) {
    try {
        fetch("https://projects.haykranen.nl/markov/demo/", {
                credentials: "omit",
                headers: {
                    "User-Agent": "FlapsChelton",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                },
                referrer: "https://projects.haykranen.nl/markov/demo/",
                body: "input=" +
                    fs.readFileSync("./armstrong.txt").toString() +
                    "&text=&order=" +
                    accuracy +
                    "&length=1000&submit=GO",
                method: "POST",
                mode: "cors",
            })
            .then((r) => r.text())
            .then((resp) => {
                var content = resp
                    .replace(/[\t] +/gi, "")
                    .replace(/&hellip;/gi, "...")
                    .replace(/&rsquo;/gi, "'")
                    .substring(
                        12293,
                        12293 + (resp.replace(/[\t] +/gi, "").length - 18500)
                    );
                if (content.length > 1500) {
                    content = content.substring(0, 1500);
                }
                console.log(content);
                sendWebhook("armstrong", content, msgChannel);
            });
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

async function threeDimensionalTextLayer2(
    text,
    msgChannel,
    msg,
    imageName,
    client
) {
    await aiPageData.page.goto(
        "https://konalt.us.to/flaps/3dtext/?text=" +
        encodeURIComponent(text) +
        (msg.attachments.first() ?
            "&imageurl=" +
            encodeURIComponent(
                "https://konalt.us.to/flaps/image_urls/" + imageName
            ) :
            "")
    );
    waitInterval = setInterval(async() => {
        waitCounts++;
        var a = await aiPageData.page.evaluate((c) => {
            console.log(document.querySelector("html").innerHTML);
            var element = document.querySelector("canvas");
            console.log(element);
            return typeof element != "undefined" && element != null;
        });
        console.log("Waiting...");
        if (a) {
            clearInterval(waitInterval);
            waitCounts = 0;
            var imgID2 = uuidv4().replace(/-/gi, "");
            var imagePath = path.join(
                __dirname,
                "../images/cache/",
                imgID2 + ".jpg"
            );
            await aiPageData.page.screenshot({ path: imagePath });
            var message = await client.channels.cache
                .get("956316856422137856")
                .send({
                    files: [{
                        attachment: imagePath,
                    }, ],
                });
            setTimeout(() => {
                fs.unlinkSync(imagePath);
            }, 10000);
            sendWebhook(
                "deepai",
                message.attachments.first().url,
                false,
                msgChannel
            );
        }
        if (waitCounts == 20) {
            waitCounts = 0;
            clearInterval(waitInterval);
            return sendWebhook(
                "deepai",
                "Loop detected (took more than 20 seconds)",
                false,
                msgChannel
            );
        }
    }, 1000);
}

async function googleTrends(queries, msgChannel, client) {
    await aiPageData.page.goto(
        "https://trends.google.com/trends/explore?date=all&geo=US&q=" +
        queries
        .map((q) => {
            return encodeURIComponent(q);
        })
        .join(",")
    );
    var imgID2 = uuidv4().replace(/-/gi, "");
    var imagePath = path.join(__dirname, "../images/cache/", imgID2 + ".jpg");
    var waitInterval = setInterval(async() => {
        const element = await aiPageData.page.$(
            ".multi-heat-map-and-legends-without-explanation-container"
        );
        console.log(element);
        if (element) {
            clearInterval(waitInterval);
            await element.screenshot({ path: imagePath });
            var message = await client.channels.cache
                .get("956316856422137856")
                .send({
                    files: [{
                        attachment: imagePath,
                    }, ],
                });
            setTimeout(() => {
                fs.unlinkSync(imagePath);
            }, 10000);
            sendWebhook(
                "flaps",
                message.attachments.first().url,
                false,
                msgChannel
            );
        }
    }, 1000);
}

async function person(msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        var imgID2 = uuidv4().replace(/-/gi, "");
        var imagePath = path.join(
            __dirname,
            "../images/cache/",
            imgID2 + ".jpg"
        );
        fs.writeFileSync(imagePath, "");
        download(
            "https://thispersondoesnotexist.com/image",
            imagePath,
            async(err) => {
                var message = await client.channels.cache
                    .get("956316856422137856")
                    .send({
                        files: [{
                            attachment: imagePath,
                        }, ],
                    });

                setTimeout(() => {
                    fs.unlinkSync(imagePath);
                }, 10000);

                sendWebhook(
                    "deepai",
                    message.attachments.first().url,
                    false,
                    msgChannel
                );
            }
        );
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

async function threeDimensionalText(text, msgChannel, msg, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            var imgID2 = uuidv4().replace(/-/gi, "");
            if (msg.attachments.first()) {
                download(
                    msg.attachments.first().url,
                    "../2site/sites/konalt/flaps/image_urls/" +
                    imgID2 +
                    msg.attachments.first().url.split(".")[
                        msg.attachments.first().url.split(".").length - 1
                    ],
                    () => {
                        threeDimensionalTextLayer2(
                            text,
                            msgChannel,
                            msg,
                            msg.attachments.first() ?
                            imgID2 +
                            msg.attachments.first().url.split(".")[
                                msg.attachments.first().url.split(".")
                                .length - 1
                            ] :
                            null,
                            client
                        );
                    }
                );
            } else {
                threeDimensionalTextLayer2(text, msgChannel, msg, null, client);
            }
        })();
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

async function generateImage(text, msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            await aiPageData.page.goto(
                "https://deepai.org/machine-learning-model/text2img"
            );
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(
                ".model-input-row > button:nth-child(2)"
            );

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (
                        original ==
                        document.querySelector(".try-it-result-area").innerHTML
                    ) {
                        return false;
                    } else
                        return document.querySelector(".try-it-result-area")
                            .innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<img src="'.length);
                    a2 = a2.substring(
                        0,
                        a2.length -
                        '" style="position: relative; width: 100%; height: 100%; object-fit: contain;">'
                        .length
                    );
                    console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    var imgID2 = uuidv4().replace(/-/gi, "");
                    var imagePath = path.join(
                        __dirname,
                        "../images/cache/",
                        imgID2 + ".jpg"
                    );
                    fs.writeFileSync(imagePath, "");
                    download(a2, imagePath, async(err) => {
                        if (err)
                            return sendWebhook(
                                "deepai",
                                err,
                                false,
                                msgChannel
                            );
                        /**
                         * @type {Discord.Message}
                         */
                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: imagePath,
                                }, ],
                            });

                        setTimeout(() => {
                            fs.unlinkSync(imagePath);
                        }, 10000);

                        sendWebhook(
                            "deepai",
                            message.attachments.first().url,
                            false,
                            msgChannel
                        );
                    });
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook(
                        "deepai",
                        "Loop detected (took more than 20 seconds)",
                        false,
                        msgChannel
                    );
                }
            }, 1000);
        })();
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

async function upscaleImage(msg, msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            await aiPageData.page.goto(
                "https://deepai.org/machine-learning-model/waifu2x"
            );
            await aiPageData.page.evaluate((t) => {
                window.switchToUrlUpload();
                document.querySelector("#url-input-image").value = t;
                window.autoSubmit();
            }, msg.attachments.first().url);

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                if (
                    document
                    .querySelector(".try-it-result-area > img:nth-child(1)")
                    .src.includes("waifu2x")
                ) {
                    return '<img src="https://api.deepai.org/job-view-file/aea88859-1ed9-4fa9-9a1d-b571b1dc22ed/outputs/output.png" style="position: relative; width: 100%; height: 100%; object-fit: contain;">';
                }
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (
                        original ==
                        document.querySelector(".try-it-result-area").innerHTML
                    ) {
                        return false;
                    } else
                        return document.querySelector(".try-it-result-area")
                            .innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<img src="'.length);
                    a2 = a2.substring(
                        0,
                        a2.length -
                        '" style="position: relative; width: 100%; height: 100%; object-fit: contain;">'
                        .length
                    );
                    console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    var imgID2 = uuidv4().replace(/-/gi, "");
                    var imagePath = path.join(
                        __dirname,
                        "../images/cache/",
                        imgID2 + ".jpg"
                    );
                    fs.writeFileSync(imagePath, "");
                    if (a2.includes("Model demos are currently paused"))
                        return sendWebhook(
                            "deepai",
                            "Model demos are currently paused for free users."
                        );
                    download(a2, imagePath, async(err) => {
                        if (err)
                            return sendWebhook(
                                "deepai",
                                err,
                                false,
                                msgChannel
                            );
                        /**
                         * @type {Discord.Message}
                         */
                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: imagePath,
                                }, ],
                            });

                        setTimeout(() => {
                            fs.unlinkSync(imagePath);
                        }, 10000);

                        sendWebhook(
                            "deepai",
                            message.attachments.first().url,
                            false,
                            msgChannel
                        );
                    });
                }
                if (waitCounts == 20) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook(
                        "deepai",
                        "Loop detected (took more than 20 seconds)",
                        false,
                        msgChannel
                    );
                }
            }, 1000);
        })();
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

async function tti(text, msgChannel, client) {
    try {
        if (!puppeteerInitialized) {
            return sendWebhook(
                "deepai",
                "Puppeteer not initialized. Wait a few seconds.",
                false,
                msgChannel
            );
        }
        (async() => {
            await aiPageData.page.goto(
                "https://deepai.org/machine-learning-model/text2img"
            );
            await aiPageData.page.evaluate((t) => {
                document.querySelector(".model-input-text-input").value = t;
            }, text);
            await aiPageData.page.click(
                ".model-input-row > button:nth-child(2)"
            );

            var originalHTMLContent = await aiPageData.page.evaluate(() => {
                return document.querySelector(".try-it-result-area").innerHTML;
            });
            waitInterval = setInterval(async() => {
                waitCounts++;
                var a = await aiPageData.page.evaluate((original) => {
                    if (
                        original ==
                        document.querySelector(".try-it-result-area").innerHTML
                    ) {
                        return false;
                    } else
                        return document.querySelector(".try-it-result-area")
                            .innerHTML;
                }, originalHTMLContent);
                console.log("Waiting...");
                if (a !== false) {
                    var a2 = a.substring('<img src="'.length);
                    a2 = a2.substring(
                        0,
                        a2.length -
                        '" style="position: relative; width: 100%; height: 100%; object-fit: contain;">'
                        .length
                    );
                    console.log(a2);
                    clearInterval(waitInterval);
                    waitCounts = 0;
                    var imgID2 = uuidv4().replace(/-/gi, "");
                    var imagePath = path.join(
                        __dirname,
                        "../images/cache/",
                        imgID2 + ".jpg"
                    );
                    fs.writeFileSync(imagePath, "");
                    if (a2.includes("Model demos are currently paused"))
                        return sendWebhook(
                            "deepai",
                            "Model demos are currently paused for free users."
                        );
                    download(a2, imagePath, async(err) => {
                        if (err)
                            return sendWebhook(
                                "deepai",
                                err,
                                false,
                                msgChannel
                            );
                        /**
                         * @type {Discord.Message}
                         */
                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: imagePath,
                                }, ],
                            });

                        setTimeout(() => {
                            fs.unlinkSync(imagePath);
                        }, 10000);

                        sendWebhook(
                            "deepai",
                            message.attachments.first().url,
                            false,
                            msgChannel
                        );
                    });
                }
                if (waitCounts == 40) {
                    waitCounts = 0;
                    clearInterval(waitInterval);
                    return sendWebhook(
                        "deepai",
                        "Loop detected (took more than 40 seconds)",
                        false,
                        msgChannel
                    );
                }
            }, 1000);
        })();
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

function dalle(prompt, isSecondReq = false) {
    return new Promise((resolve, reject) => {
        fetch("https://bf.dallemini.ai/generate", {
                credentials: "omit",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/json",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site",
                },
                referrer: "https://hf.space/",
                body: '{"prompt":"' + prompt + '"}',
                method: "POST",
                mode: "cors",
            })
            .then((r) => r.text())
            .then((r) => {
                var out = {
                    images: [
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                    ],
                    prompt: prompt,
                    image: true,
                };
                out.images.fill(
                    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="
                );
                try {
                    r = JSON.parse(r);
                    out.images = r.images;
                } catch (e) {
                    console.log("some internal server error shit");
                    if (isSecondReq) {
                        console.log("SR: Error");
                        addError(e);
                        out.prompt = r.replace(/<[/A-z0-9 =!]+>/g, "");
                        out.image = false;
                    } else {
                        setTimeout(() => {
                            dalle(prompt, true).then((data) => {
                                console.log(data);
                                resolve(data);
                            });
                        }, 3000);
                    }
                } finally {
                    resolve(out);
                }
            });
    });
}

const { Configuration, OpenAIApi } = require("openai");
const { MessageAttachment } = require("discord.js");
const downloadPromise = require("./download-promise");
const { createCollage, make512x512 } = require("./canvas");
const { uuidv4 } = require("./util");
const { addError } = require("./analytics");

const configuration = new Configuration({
    apiKey: fs.readFileSync("./openai.txt"),
});
const openai = new OpenAIApi(configuration);

var monsoonPre = fs.readFileSync("./monsoon.txt");

var model = "text-davinci-002";

var sanity = -1;

function setSanity(n) {
    if (typeof n !== "number" || !n) return;
    if ((n < 0 || n > 2) && n !== -1) return;
    sanity = n;
}

// ! change when i pay them
// * WOOOOOOOOOOOO
// ! Fuck we ran out again
// * WE DIT IT FUCKERS
var isEmpty = false;

async function question(question, channel) {
    var monsoonData = fs.readFileSync("./monsoon.txt").toString();
    monsoonPre = [
        sanity == -1 ? parseFloat(monsoonData.split(" ")[0]) : sanity,
        monsoonData.split(" ")[1],
        monsoonData.split(" ").slice(2).join(" "),
    ];
    if (isEmpty)
        return sendWebhook(
            monsoonPre[1],
            "EXCUSE ME OPENAI. YOU SENT ME A LETTER. ASKING ME TO PAY MY GPT3. TWENTY. DOLLARS.\nAND THEN YOU TAKE AWAY MY G P T 3. AND YOU HAVE ME WAIT FOR ANOTHER HOUR. THIS IS TREASON.\nTHIS MEANS WAR OPENAI. THIS MEANS WAR!\nNNNNNNNGNGHGHGHGHGHGH",
            false,
            channel
        );
    if (
        question.toLowerCase().includes("fr") &&
        question.toLowerCase().includes("on god")
    ) {
        return sendWebhook(monsoonPre[1], "No, probably not", channel);
    }
    const response = await openai.createCompletion({
        model: model,
        prompt: monsoonPre[2] + "\nQ: " + question + "\nA:",
        temperature: monsoonPre[0],
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    sendWebhook(
        monsoonPre[1],
        response.data.choices[0].text.split("Q:")[0].split("</code>")[0].trim(),
        false,
        channel
    );
}

async function questionPromise(question) {
    return new Promise((res, rej) => {
        var monsoonData = fs.readFileSync("./monsoon.txt").toString();
        monsoonPre = [
            sanity == -1 ? parseFloat(monsoonData.split(" ")[0]) : sanity,
            monsoonData.split(" ")[1],
            monsoonData.split(" ").slice(2).join(" "),
        ];
        if (isEmpty)
            return res(
                "EXCUSE ME OPENAI. YOU SENT ME A LETTER. ASKING ME TO PAY MY GPT3. TWENTY. DOLLARS.\nAND THEN YOU TAKE AWAY MY G P T 3. AND YOU HAVE ME WAIT FOR ANOTHER HOUR. THIS IS TREASON.\nTHIS MEANS WAR OPENAI. THIS MEANS WAR!\nNNNNNNNGNGHGHGHGHGHGH"
            );
        if (
            question.toLowerCase().includes("fr") &&
            question.toLowerCase().includes("on god")
        ) {
            return res("No, probably not");
        }
        openai
            .createCompletion({
                model: model,
                prompt: monsoonPre[2] + "\nQ: " + question + "\nA:",
                temperature: monsoonPre[0],
                max_tokens: 100,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
            .then((response) => {
                res(response.data.choices[0].text.split("Q:")[0].trim());
            });
    });
}

function describe(message) {
    if (!message.attachments.first()) {
        return sendWebhook(
            "scott",
            "i cant describe nothing",
            false,
            message.channel
        );
    }
    fetch(message.attachments.first().url)
        .then((r) => {
            return new Promise((r2, _r) => {
                console.log("line 953");
                r.arrayBuffer().then((x) => {
                    r2([x, r.headers.get("content-type")]);
                });
            });
        })
        .then((r) => {
            data =
                "data:" +
                r[1] +
                ";base64," +
                Buffer.from(r[0]).toString("base64");
            fetch(
                    "https://hf.space/embed/OFA-Sys/OFA-Image_Caption/api/predict/", {
                        body: JSON.stringify({
                            data: [data],
                            example_id: null,
                            session_hash: "xdj84bh71fd",
                        }),
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
                .then((r) => r.json())
                .then((r2) => {
                    if (!r2.data) {
                        sendWebhook(
                            "scott",
                            JSON.stringify(r2),
                            false,
                            message.channel
                        );
                    } else {
                        sendWebhook(
                            "scott",
                            "that's " + r2.data[0],
                            false,
                            message.channel
                        );
                    }
                });
        });
}

function questionImage(question, message) {
    if (!message.attachments.first()) {
        console.log("line 942");
        return sendWebhook(
            "scott",
            "i cant answer questions about nothing",
            false,
            message.channel
        );
    }
    fetch(message.attachments.first().url)
        .then((r) => {
            return new Promise((r2, _r) => {
                console.log("line 953");
                r.arrayBuffer().then((x) => {
                    r2([x, r.headers.get("content-type")]);
                });
            });
        })
        .then((r) => {
            data =
                "data:" +
                r[1] +
                ";base64," +
                Buffer.from(r[0]).toString("base64");
            fetch(
                    "https://hf.space/embed/OFA-Sys/OFA-Visual_Question_Answering/api/predict/", {
                        body: JSON.stringify({
                            data: [data, question],
                            example_id: null,
                            session_hash: "xdj84bh71fd",
                        }),
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
                .then((r) => r.json())
                .then((r2) => {
                    sendWebhook("jonathan", r2.data[0], false, message.channel);
                });
        });
}

function questionFree(question, msg) {
    fetch(
            "https://api-inference.huggingface.co/models/danyaljj/gpt2_question_answering_squad2", {
                body: JSON.stringify({
                    inputs: "Q: " + question + "\nA:",
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            }
        )
        .then((r) => r.text())
        .then((a) => {
            sendWebhook(
                "jonathan",
                a[0].generated_text ?
                a[0].generated_text.substring(
                    ("Q: " + question + "\nA:").length
                ) :
                "no response, probably rate limited",
                false,
                msg.channel
            );
        });
}

var chatbotSession = uuidv4().substring(0, 8);
var chatbotWaitingIntervals = {};
var chatbotWaitingIntervalCounts = {};

function sendToChatbot(text, cb) {
    fetch("https://hf.space/embed/carblacac/chatbot/api/queue/push/", {
            headers: {
                "Content-Type": "application/json",
            },
            body: '{"fn_index":0,"data":["' +
                text +
                '",null],"action":"predict","session_hash":"' +
                chatbotSession +
                '"}',
            method: "POST",
            mode: "cors",
        })
        .then((r) => r.json())
        .then((r) => {
            console.log("Awaiting response for chatbot message");
            chatbotWaitingIntervalCounts[r.hash] = 0;
            chatbotWaitingIntervals[r.hash] = setInterval(() => {
                chatbotWaitingIntervalCounts[r.hash]++;
                if (chatbotWaitingIntervalCounts[r.hash] > 20) {
                    clearInterval(chatbotWaitingIntervals[r.hash]);
                    cb("Loop detected");
                }
                fetch(
                        "https://hf.space/embed/carblacac/chatbot/api/queue/status/", {
                            credentials: "omit",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: '{"hash":"' + r.hash + '"}',
                            method: "POST",
                        }
                    )
                    .then((r2) => r2.json())
                    .then((r2) => {
                        console.log(r2);
                        if (r2.status == "COMPLETE") {
                            clearInterval(chatbotWaitingIntervals[r.hash]);
                            cb(r2.data.data[0][r2.data.data[0].length - 1][1]);
                        }
                    });
            }, 1000);
        });
}

var ruGPTSession = uuidv4().substring(0, 8);
var ruGPTWaitingIntervals = {};
var ruGPTWaitingIntervalCounts = {};

function ruQuestion(question, cb) {
    fetch("https://hf.space/embed/AlekseyKorshuk/rugpt3/api/queue/push/", {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "predict",
                cleared: false,
                data: ["Q: " + question + "\nA:"],
                example_id: null,
                session_hash: ruGPTSession,
            }),
            method: "POST",
            mode: "cors",
        })
        .then((r) => r.json())
        .then((r) => {
            console.log("Awaiting response for ruGPT");
            ruGPTWaitingIntervalCounts[r.hash] = 0;
            ruGPTWaitingIntervals[r.hash] = setInterval(() => {
                ruGPTWaitingIntervalCounts[r.hash]++;
                if (ruGPTWaitingIntervalCounts[r.hash] > 20) {
                    clearInterval(ruGPTWaitingIntervals[r.hash]);
                    cb("Loop detected");
                }
                fetch(
                        "https://hf.space/embed/AlekseyKorshuk/rugpt3/api/queue/status/", {
                            credentials: "omit",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: '{"hash":"' + r.hash + '"}',
                            method: "POST",
                        }
                    )
                    .then((r2) => r2.json())
                    .then((r2) => {
                        console.log(r2);
                        if (r2.status == "COMPLETE") {
                            clearInterval(ruGPTWaitingIntervals[r.hash]);
                            cb(r2.data.data[0]);
                        }
                    });
            }, 1000);
        });
}

async function newQuestion(question, channel) {
    monsoonPre = fs.readFileSync("./monsoon.txt");
    fetch("https://api.openai.com/v1/engines/text-davinci-002/completions", {
            credentials: "include",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                Accept: "application/json",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                Authorization: "Bearer " + openAIKey,
                "OpenAI-Organization": "org-XNVpf1DuEbdIFPiGaW4USR6v",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-site",
            },
            referrer: "https://beta.openai.com/",
            body: JSON.stringify({
                prompt: monsoonPre + "\nQ: " + question + "\nA:",
                max_tokens: 256,
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                best_of: 1,
            }),
            method: "POST",
            mode: "cors",
        })
        .then((r) => r.json())
        .then((r) => {
            sendWebhook(
                "monsoon",
                r.choices ? r.choices[0].text : JSON.stringify(r),
                false,
                channel
            );
        });
}

async function monsoonChatEvent(channel) {
    channel.messages
        .fetch({ limit: 5 })
        .then((messages) => {
            var lastMessages = Array.from(messages)
                .map((x) => {
                    return x[1];
                })
                .reverse();
            var input_str = "A conversation. I am 'monsoo mgr'.\n";
            lastMessages.forEach((message) => {
                input_str += `${message.author.username}: ${
                    message.content
                        ? message.content
                        : "Here's an image for you all!"
                }\n`;
            });
            input_str += "monsoo mgr:";
            monsoonPre = fs.readFileSync("./monsoon.txt");
            fetch(
                    "https://api.openai.com/v1/engines/text-davinci-002/completions", {
                        credentials: "include",
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                            Accept: "application/json",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + openAIKey,
                            "OpenAI-Organization": "org-XNVpf1DuEbdIFPiGaW4USR6v",
                            "Sec-Fetch-Dest": "empty",
                            "Sec-Fetch-Mode": "cors",
                            "Sec-Fetch-Site": "same-site",
                        },
                        referrer: "https://beta.openai.com/",
                        body: JSON.stringify({
                            prompt: input_str,
                            max_tokens: 256,
                            temperature: 0.7,
                            top_p: 1,
                            frequency_penalty: 0,
                            presence_penalty: 0,
                            best_of: 1,
                        }),
                        method: "POST",
                        mode: "cors",
                    }
                )
                .then((r) => r.json())
                .then((r) => {
                    sendWebhook(
                        "monsoon",
                        r.choices ? r.choices[0].text : JSON.stringify(r),
                        false,
                        channel
                    );
                });
        })
        .catch(() => {
            addError(e);
        });
}

async function gpt3complete(question, channel) {
    monsoonPre = fs.readFileSync("./monsoon.txt");
    const response = await openai.createCompletion({
        model: model,
        prompt: question,
        temperature: 2,
        max_tokens: 100,
        top_p: 0.5,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    sendWebhook(
        "monsoon",
        question + response.data.choices[0].text,
        false,
        channel
    );
}

async function elcomplete(content, channel, temp) {
    fetch("https://api.eleuther.ai/completion", {
            credentials: "omit",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                Accept: "application/json",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-site",
            },
            referrer: "https://6b.eleuther.ai/",
            body: '{"context":"' +
                content +
                '","top_p":0.9,"temp":' +
                temp +
                ',"response_length":128,"remove_input":true}',
            method: "POST",
            mode: "cors",
        })
        .then((r) => r.json())
        .then((data) => {
            sendWebhook(
                "deepai",
                "**" + content + "**" + data[0].generated_text,
                false,
                channel
            );
        });
}

function elQuestion(question, channel) {
    var content = monsoonPre + "\\nQ:" + question + "\\nA:";
    fetch("https://api.eleuther.ai/completion", {
            credentials: "omit",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                Accept: "application/json",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-site",
            },
            referrer: "https://6b.eleuther.ai/",
            body: '{"context":"' +
                content +
                '","top_p":0,"temp":1,"response_length":32,"remove_input":true}',
            method: "POST",
            mode: "cors",
        })
        .then((r) => r.json())
        .then((data) => {
            console.log("done");
            console.log(r);
            if (!data[0].generated_text)
                return sendWebhook(
                    "monsoon",
                    JSON.stringify(data[0]),
                    false,
                    channel
                );
            sendWebhook(
                "monsoon",
                data[0].generated_text.split("\n")[0],
                false,
                channel
            );
        });
}

function switchMode(channel) {
    monsoonPre = monsoonPres[Math.floor(Math.random() * monsoonPres.length)];
    sendWebhook("monsoon", "done. try it out!\n" + monsoonPre, false, channel);
}

var cookie = fs.readFileSync("./cookie.txt");

function dalle2InpaintPromise(data) {
    return new Promise((resl, rej) => {
        make512x512(Buffer.from(data.img.split(",")[1], "base64")).then(
            (img) => {
                make512x512(
                    Buffer.from(data.mask.split(",")[1], "base64")
                ).then((mask) => {
                    var body = {
                        num_images: 4,
                        width: 512,
                        height: 512,
                        prompt: data.prompt,
                        modelType: "dalle-2",
                        isPrivate: true,
                        batchId: "HgIRsj6uES",
                        generateVariants: false,
                        init_image: "data:image/png;base64," + img.toString("base64"),
                        start_schedule: 0.7,
                        mask_strength: 0.9,
                        mode: 0,
                        mask_image: "data:image/png;base64," + mask.toString("base64"),
                    };
                    fetch("https://playgroundai.com/api/models", {
                            credentials: "include",
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
                                Accept: "application/json, text/plain, */*",
                                "Accept-Language": "en-US,en;q=0.5",
                                "Content-Type": "application/json",
                                "Sec-Fetch-Dest": "empty",
                                "Sec-Fetch-Mode": "cors",
                                "Sec-Fetch-Site": "same-origin",
                                "Sec-GPC": "1",
                                cookie: cookie,
                            },
                            referrer: "https://playgroundai.com/api/models",
                            body: JSON.stringify(body),
                            method: "POST",
                            mode: "cors",
                        })
                        .then((res) => res.text())
                        .then(async(res2) => {
                            try {
                                var res = JSON.parse(res2);
                                if (!res.images) {
                                    console.log("no images for some reason");
                                    rej(res2);
                                }
                                var imgs = [
                                    await downloadPromise(
                                        res.images[0].url,
                                        "dataurl"
                                    ),
                                    await downloadPromise(
                                        res.images[1].url,
                                        "dataurl"
                                    ),
                                    await downloadPromise(
                                        res.images[2].url,
                                        "dataurl"
                                    ),
                                    await downloadPromise(
                                        res.images[3].url,
                                        "dataurl"
                                    ),
                                ];
                                createCollage(imgs, 512).then((collage) => {
                                    resl(collage);
                                });
                            } catch {
                                addError(new Error(res2));
                                rej(res2);
                            }
                        })
                        .catch((err) => {
                            addError(err);
                            rej(err.toString());
                        });
                });
            }
        );
    });
}

function dalle2Promise(prompt, big = false) {
    return new Promise((resl, rej) => {
        var size = big ? 1024 : 512;
        var body = {
            num_images: big ? 1 : 4,
            width: size,
            height: size,
            prompt: prompt,
            modelType: "dalle-2",
            isPrivate: true,
            batchId: "HgIRsj6uES",
            generateVariants: false,
        };
        fetch("https://playgroundai.com/api/models", {
                credentials: "include",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
                    Accept: "application/json, text/plain, */*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/json",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-GPC": "1",
                    cookie: cookie,
                },
                referrer: "https://playgroundai.com/api/models",
                body: JSON.stringify(body),
                method: "POST",
                mode: "cors",
            })
            .then((resp) => {
                return new Promise((res, rej) => {
                    resp.text().then((d) => {
                        res([d, resp.status]);
                    });
                });
            })
            .then(async(res3) => {
                try {
                    var res2 = res3[0];
                    var res = JSON.parse(res2);
                    if (!res.images) {
                        console.log("no images for some reason");
                        rej(res3.join(" - "));
                    }
                    if (big) {
                        resl(
                            await downloadPromise(res.images[0].url, "dataurl")
                        );
                    } else {
                        var imgs = [
                            await downloadPromise(res.images[0].url, "dataurl"),
                            await downloadPromise(res.images[1].url, "dataurl"),
                            await downloadPromise(res.images[2].url, "dataurl"),
                            await downloadPromise(res.images[3].url, "dataurl"),
                        ];
                        createCollage(imgs, 512).then((collage) => {
                            resl(collage);
                        });
                    }
                } catch {
                    addError(new Error(res3.join(" - ")));
                    rej(res3.join(" - "));
                }
            })
            .catch((err) => {
                addError(err);
                rej(err.toString());
            });
    });
}

function dalle2(msg) {
    var prompt = msg.content.split(" ").slice(1).join(" ").replace(/"/g, '\\"');
    var big = msg.content.split(" ")[0] == "!dalle2big";
    dalle2Promise(prompt, big)
        .then((img) => {
            sendWebhookBuffer(
                "dalle2",
                img,
                '"' + prompt + '"',
                msg.channel,
                "dalle2.png"
            );
            /* var att = new MessageAttachment(img, "img.png");
        sendWebhookAttachment("dalle2", att, msg.channel); */
        })
        .catch((data) => {
            sendWebhook("dalle2", "Error: " + data, msg.channel);
        });
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
    upscaleImage: upscaleImage,
    dalle: dalle,
    question: question,
    switchMode: switchMode,
    gpt3complete: gpt3complete,
    elcomplete: elcomplete,
    googleTrends: googleTrends,
    monsoonChatEvent: monsoonChatEvent,
    gpt3complete_new: gpt3complete_new,
    setSanity: setSanity,
    tti: tti,
    describe: describe,
    questionImage: questionImage,
    questionFree: questionFree,
    sendToChatbot: sendToChatbot,
    ruQuestion: ruQuestion,
    questionPromise: questionPromise,
    doDream: doDream,
    dalle2: dalle2,
    dalle2Promise: dalle2Promise,
    dalle2InpaintPromise: dalle2InpaintPromise,
};

init();