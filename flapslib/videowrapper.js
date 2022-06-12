const video = require("./video");
const { uuidv4 } = require("./ai");
const { sendWebhook, sendWebhookFile } = require("./webhooks");
const fs = require("fs");
const path = require("path");

async function addText(name, text, msg) {
    if (typeof text == "string") {
        text = text.split(":");
    }
    var id = uuidv4().replace(/-/gi, "") + ".gif";
    var gifData = fs.readFileSync(path.join(__dirname, "..", "images/gif/gifdata.txt")).toString().split("\r\n").filter((l) => { return l.split(" ")[0] == name; })[0].split(" ");
    // Name
    // Font size
    // Text X 1
    // Text Y 1
    // Text X 2
    // Text Y 2
    video.addText("images/gif/" + name + ".gif", "images/cache/" + id, {
        text: text[0],
        fontsize: gifData[1],
        x: gifData[2],
        y: gifData[3]
    }).then(async() => {
        var id2 = uuidv4().replace(/-/gi, "") + ".gif";
        video.addText("images/cache/" + id, "images/cache/" + id2, {
            text: text[1],
            fontsize: gifData[1],
            x: gifData[4],
            y: gifData[5]
        }).then(async() => {
            try {
                console.log(id, id2);
                var message = await client.channels.cache.get("956316856422137856").send({
                    files: [{
                        attachment: "images/cache/" + id2
                    }]
                });

                setTimeout(() => {
                    fs.unlinkSync("images/cache/" + id);
                    fs.unlinkSync("images/cache/" + id2);
                }, 10000);

                sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
            } catch {
                sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
            }
        });
    });
}
async function simpleMemeCaption(name, text, msg, client) {
    if (parseInt(msg.content.split(" ")[1])) {
        text = text.split(" ").slice(1).join(" ");
    }
    if (typeof text == "string") {
        text = text.split(":");
    }
    if (!text[1]) {
        text[1] = "";
    }
    var id = uuidv4().replace(/-/gi, "");
    var ext = "." + msg.attachments.first().url.split('.').pop();
    var subtitleFileData = `1
00:00:00,000 --> 00:50:00,000
${text[0]}`;
    var subtitleFileData2 = `1
00:00:00,000 --> 00:50:00,000
${text[1]}`;
    fs.writeFileSync("./subs.srt", subtitleFileData);
    fs.writeFileSync("./subs_bottom.srt", subtitleFileData2);
    video.simpleMemeCaption("images/cache/" + name + ext, "images/cache/" + id + ext, {
        fontSize: (!parseInt(msg.content.split(" ")[1]) ? 30 : parseInt(msg.content.split(" ")[1]))
    }).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ext
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ext);
                fs.unlinkSync("images/cache/" + name + ext);
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function squash(name, msg) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = "." + msg.attachments.first().url.split('.').pop();
    video.squash("images/cache/" + name + ext, "images/cache/" + id + ext).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ext
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ext);
                fs.unlinkSync("images/cache/" + name + ext);
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function stretch(name, msg) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = "." + msg.attachments.first().url.split('.').pop();
    video.stretch("images/cache/" + name + ext, "images/cache/" + id + ext).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ext
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ext);
                fs.unlinkSync("images/cache/" + name + ext);
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function trim(name, times, msg, client) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = "." + msg.attachments.first().url.split('.').pop();
    video.trim("images/cache/" + name + ext, "images/cache/" + id + ext, {
        start: times[0],
        end: times[1]
    }).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ext
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ext);
                fs.unlinkSync("images/cache/" + name + ext);
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}

var client;

function setClient(c) {
    client = c;
}
async function videoGif(name, msg) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = "." + msg.attachments.first().url.split('.').pop();
    video.videoGif("images/cache/" + name + ext, "images/cache/" + id + ".gif").then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ".gif"
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ".gif");
                fs.unlinkSync("images/cache/" + name + ext);
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function imageAudio(name, msg, client) {
    var id = uuidv4().replace(/-/gi, "");
    video.imageAudio("images/cache/" + name, "images/cache/" + id).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ".mp4"
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ".mp4");
                fs.unlinkSync("images/cache/" + name + ".png");
                fs.unlinkSync("images/cache/" + name + ".mp3");
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function gifAudio(name, msg, client) {
    var id = uuidv4().replace(/-/gi, "");
    video.gifAudio("images/cache/" + name, "images/cache/" + id).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ".mp4"
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ".mp4");
                fs.unlinkSync("images/cache/" + name + ".gif");
                fs.unlinkSync("images/cache/" + name + ".mp3");
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function videoAudio(name, msg) {
    var id = uuidv4().replace(/-/gi, "");
    video.videoAudio("images/cache/" + name, "images/cache/" + id).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ".mp4"
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ".mp4");
                fs.unlinkSync("images/cache/" + name + ".mp4");
                fs.unlinkSync("images/cache/" + name + ".mp3");
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function armstrongify(name, msg, duration, client) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = name.endsWith(".mp4") ? ".mp4" : ".png";
    video.armstrongify("images/cache/" + name, "images/cache/" + id, {
        videoLength: duration,
        isVideo: ext == ".mp4"
    }).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ".mp4"
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ".mp4");
            }, 10000);

            sendWebhook("armstrong", message.attachments.first().url, true, msg.channel);
        } catch {
            sendWebhook("armstrong", "LISTEN, JACK. I FUCKING HATE ERRORS.", false, msg.channel);
        }
    });
}
async function baitSwitch(name, msg, client, opt = {}) {
    var id = uuidv4().replace(/-/gi, "");
    video.baitSwitch("images/cache/" + name, "images/cache/" + id, opt).then(async() => {
        try {
            var message = await client.channels.cache.get("956316856422137856").send({
                files: [{
                    attachment: "images/cache/" + id + ".mp4"
                }]
            });

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + id + ".mp4");
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, true, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "LISTEN, JACK. I FUCKING HATE ERRORS.", false, msg.channel);
        }
    });
}
async function stitch(names, msg) {
    var id = uuidv4().replace(/-/gi, "");
    video.stitch(["images/cache/" + names[0], "images/cache/" + names[1]], "images/cache/" + id).then(async() => {
        try {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ".mp4", false, msgChannel);

            setTimeout(() => {
                fs.unlinkSync("images/cache/" + names[0]);
                fs.unlinkSync("images/cache/" + names[1]);
            }, 10000);

            sendWebhook("ffmpeg", message.attachments.first().url, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}
async function geq(name, msg) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = ".mp4";
    if (msg.attachments.first()) {
        ext = "." + msg.attachments.first().url.split('.').pop();
    }
    video.geq((name == "nullsrc" ? "nullsrc=s=256x256" : "images/cache/" + name + ext), "images/cache/" + id + ext, {
        red: msg.content.split(" ").slice(1)[0],
        green: msg.content.split(" ").slice(1).length > 1 ? msg.content.split(" ").slice(1)[1] : msg.content.split(" ").slice(1)[0],
        blue: msg.content.split(" ").slice(1).length > 1 ? msg.content.split(" ").slice(1)[2] : msg.content.split(" ").slice(1)[0]
    }).then(async() => {
        try {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, false, msgChannel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}

async function complexFFmpeg(name, msg) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = ".mp4";
    if (msg.attachments.first()) {
        ext = "." + msg.attachments.first().url.split('.').pop();
    }
    video.complexFFmpeg((name == "nullsrc" ? "nullsrc=s=256x256" : "images/cache/" + name + ext), "images/cache/" + id + ext, {
        args: msg.content.split(" ").slice(1).join(" "),
    }).then(async() => {
        try {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, false, msgChannel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}

async function mimeNod(bpm, msg) {
    var id = uuidv4().replace(/-/gi, "");
    var ext = ".gif";
    video.mimeNod("images/cache/" + id + ext, bpm).then(async() => {
        try {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, false, msg.channel);
        } catch {
            sendWebhook("ffmpeg", "oops, looks like the vido too bigge.", false, msg.channel);
        }
    });
}

module.exports = {
    addText: addText,
    simpleMemeCaption: simpleMemeCaption,
    imageAudio: imageAudio,
    geq: geq,
    squash: squash,
    stretch: stretch,
    trim: trim,
    stitch: stitch,
    videoAudio: videoAudio,
    videoGif: videoGif,
    armstrongify: armstrongify,
    complexFFmpeg: complexFFmpeg,
    baitSwitch: baitSwitch,
    setClient: setClient,
    mimeNod: mimeNod,
    gifAudio: gifAudio
}