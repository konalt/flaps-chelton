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
    var gifData = fs
        .readFileSync(path.join(__dirname, "..", "images/gif/gifdata.txt"))
        .toString()
        .split("\r\n")
        .filter((l) => {
            return l.split(" ")[0] == name;
        })[0]
        .split(" ");
    // Name
    // Font size
    // Text X 1
    // Text Y 1
    // Text X 2
    // Text Y 2
    video
        .addText("images/gif/" + name + ".gif", "images/cache/" + id, {
            text: text[0],
            fontsize: gifData[1],
            x: gifData[2],
            y: gifData[3],
        })
        .then(async() => {
            var id2 = uuidv4().replace(/-/gi, "") + ".gif";
            video
                .addText("images/cache/" + id, "images/cache/" + id2, {
                    text: text[1],
                    fontsize: gifData[1],
                    x: gifData[4],
                    y: gifData[5],
                })
                .then(() => {
                    sendWebhookFile(
                        "ffmpeg",
                        "images/cache/" + id,
                        msg.channel
                    );
                });
        });
}

function n(type) {
    return (
        type + "_" + uuidv4().toUpperCase().replace(/-/gi, "").substring(0, 8)
    );
}
async function caption2(name, text, msg, att) {
    var id = n("Effect_Caption2");
    var ext = "." + name.split(".").pop();
    video
        .caption2("images/cache/" + name, "images/cache/" + id + ext, {
            w: att.width,
            h: att.height,
            text: text,
        })
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function cookingVideo(name, msg) {
    var id = n("Effect_CookingVideo");
    var ext = "." + name.split(".").pop();
    video
        .cookingVideo("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ext + ".mp4",
                msg.channel
            );
        });
}
async function simpleMemeCaption(name, text, msg, client, url) {
    if (!url) url = msg.attachments.first().url;
    if (parseInt(msg.content.split(" ")[1])) {
        text = text.split(" ").slice(1).join(" ");
    }
    if (typeof text == "string") {
        text = text.split(":");
    }
    if (!text[1]) {
        text[1] = "";
    }
    var id = n("Effect_Caption");
    var ext = "." + url.split(".").pop();
    var subtitleFileData = `1
00:00:00,000 --> 00:50:00,000
${text[0]}`;
    var subtitleFileData2 = `1
00:00:00,000 --> 00:50:00,000
${text[1]}`;
    fs.writeFileSync("./subs.srt", subtitleFileData);
    fs.writeFileSync("./subs_bottom.srt", subtitleFileData2);
    video
        .simpleMemeCaption("images/cache/" + name, "images/cache/" + id + ext, {
            fontSize: !parseInt(msg.content.split(" ")[1]) ?
                30 :
                parseInt(msg.content.split(" ")[1]),
        })
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function squash(name, msg) {
    var id = n("Effect_Squash");
    var ext = "." + name.split(".").pop();
    video
        .squash("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function compress(name, msg) {
    var id = n("Effect_Compress");
    var ext = "." + name.split(".").pop();
    video
        .compress("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function speed(name, msg) {
    var id = n("Effect_Speed");
    var ext = "." + name.split(".").pop();
    video
        .speed(
            "images/cache/" + name,
            "images/cache/" + id + ext,
            parseFloat(msg.content.split(" ")[1]) || 1.5
        )
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function bassBoost(name, msg) {
    var id = n("Effect_BassBoost");
    var ext = "." + name.split(".").pop();
    video
        .bassBoost("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function theHorror(name, msg) {
    var id = n("Effect_TheHorror");
    video
        .theHorror("images/cache/" + name, "images/cache/" + id + ".mp4")
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function stewie(name, msg) {
    var id = n("Effect_Stewie");
    video
        .stewie("images/cache/" + name, "images/cache/" + id + ".mp4")
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function reverse(name, msg) {
    var id = n("Effect_Reverse");
    var ext = "." + name.split(".").pop();
    video
        .reverse("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function stretch(name, msg) {
    var id = n("Effect_Stretch");
    var ext = "." + name.split(".").pop();
    video
        .stretch("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function invert(name, msg) {
    var id = n("Effect_Invert");
    var ext = "." + name.split(".").pop();
    video
        .invert("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function trim(name, times, msg) {
    var id = n("Effect_Trim");
    var ext = "." + name.split(".").pop();
    video
        .trim("images/cache/" + name, "images/cache/" + id + ext, {
            start: times[0],
            end: times[1],
        })
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function videoGif(name, msg) {
    var id = n("Effect_VideoGif");
    video
        .videoGif("images/cache/" + name, "images/cache/" + id + ".gif")
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".gif",
                msg.channel
            );
        });
}
async function imageAudio(name, msg, exts, reverse) {
    var id = n("Effect_CImageAudio");
    video
        .imageAudio("images/cache/" + name, "images/cache/" + id, reverse, exts)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function gifAudio(name, msg, exts, reverse) {
    var id = n("Effect_CGifAudio");
    video
        .gifAudio("images/cache/" + name, "images/cache/" + id, reverse, exts)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function videoAudio(name, msg, exts, reverse) {
    var id = n("Effect_CVideoAudio");
    video
        .videoAudio("images/cache/" + name, "images/cache/" + id, reverse, exts)
        .then(async() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function armstrongify(name, msg, duration) {
    var id = n("Effect_Armstrong");
    var ext = name.endsWith(".mp4") ? ".mp4" : ".png";
    video
        .armstrongify("images/cache/" + name, "images/cache/" + id, {
            videoLength: duration,
            isVideo: ext == ".mp4",
        })
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function baitSwitch(name, msg, client, opt = {}) {
    var id = n("Effect_BaitSwitch");
    video
        .baitSwitch("images/cache/" + name, "images/cache/" + id, opt)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function stitch(names, msg) {
    var id = n("Effect_Stitch");
    video
        .stitch(
            ["images/cache/" + names[0], "images/cache/" + names[1]],
            "images/cache/" + id
        )
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function geq(name, msg) {
    var id = n("Effect_GEQ");
    var ext = ".mp4";
    if (msg.attachments.first()) {
        ext = "." + name.split(".").pop();
    }
    video
        .geq(
            name == "nullsrc" ? "nullsrc=s=256x256" : "images/cache/" + name,
            "images/cache/" + id + ext, {
                red: msg.content.split(" ").slice(1)[0],
                green: msg.content.split(" ").slice(1).length > 1 ?
                    msg.content.split(" ").slice(1)[1] :
                    msg.content.split(" ").slice(1)[0],
                blue: msg.content.split(" ").slice(1).length > 1 ?
                    msg.content.split(" ").slice(1)[2] :
                    msg.content.split(" ").slice(1)[0],
            }
        )
        .then(async() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}

async function complexFFmpeg(name, msg) {
    var id = n("Effect_Complex");
    var ext = ".mp4";
    if (msg.attachments.first()) {
        ext = "." + name.split(".").pop();
    }
    video
        .complexFFmpeg(
            name == "nullsrc" ? "nullsrc=s=256x256" : "images/cache/" + name,
            "images/cache/" + id + ext, {
                args: msg.content.split(" ").slice(1).join(" "),
            }
        )
        .then(async() => {
            try {
                sendWebhookFile(
                    "ffmpeg",
                    "images/cache/" + id + ext,
                    msg.channel
                );
            } catch {
                sendWebhook(
                    "ffmpeg",
                    "oops, looks like the vido too bigge.",
                    msg.channel
                );
            }
        });
}

async function mimeNod(bpm, msg) {
    var id = n("MimeNod");
    var ext = ".gif";
    video.mimeNod("images/cache/" + id + ext, bpm).then(async() => {
        sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
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
    mimeNod: mimeNod,
    gifAudio: gifAudio,
    compress: compress,
    caption2: caption2,
    reverse: reverse,
    theHorror: theHorror,
    stewie: stewie,
    bassBoost: bassBoost,
    cookingVideo: cookingVideo,
    speed: speed,
    invert: invert,
};