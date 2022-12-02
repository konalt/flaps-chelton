const cp = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");
const { sendWebhook } = require("./webhooks");
const path = require("path");
const download = require("./download");
const { uuidv4 } = require("./ai");

function getFirstResultID(search) {
    if (search.includes("weezer")) return "kemivUKb4f4";
    var ytProcess = cp.spawnSync(
        "yt-dlp",
        (
            "ytsearch:" +
            search.split(" ").join("+") +
            " --get-id --default-search ytsearch"
        ).split(" ")
    );
    return ytProcess.stdout.toString().trim();
}

function downloadYoutube(
    player,
    url,
    msgChannel,
    verbose = false,
    attachRecorder
) {
    if (url.startsWith("<")) url = url.substring(1);
    if (url.endsWith(">")) url = url.substring(0, url.length - 1);
    //fs.appendFileSync("./audio/yt/log.txt", "Downloading YouTube URL");
    var id = url.includes("newgrounds")
        ? url.split("/")[5]
        : url.includes("youtube.com/watch?v=")
        ? url.split("=")[1]
        : getFirstResultID(url);
    if (id === "kemivUKb4f4" || id === "NNv2RHR62Rs") {
        return sendWebhook(
            "flaps",
            "https://newgrounds.com/portal/view/805579",
            true,
            msgChannel
        );
    }
    if (!url.startsWith("http")) {
        url = "https://youtube.com/watch?v=" + id;
        sendWebhook("flaps", url, msgChannel);
    }
    if (fs.existsSync("./audio/yt/" + id + ".mp3")) {
        attachRecorder(player, "yt/" + id);
    } else {
        var ytProcess = cp.spawn(
            "yt-dlp",
            (url + " -x --audio-format mp3 -o ./audio/yt/" + id + ".mp3").split(
                " "
            )
        );
        ytProcess.stdout.on("data", (data) => {
            //fs.appendFileSync("./audio/yt/log.txt", data.toString());
            if (verbose) sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.stderr.on("data", (data) => {
            sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.on("close", (code) => {
            if (code == 1) {
                sendWebhook(
                    "flaps",
                    "Error downloading youtube URL.",
                    true,
                    msgChannel
                );
            } else {
                attachRecorder(player, "yt/" + id);
            }
        });
    }
}

async function downloadYoutubeToMP3(url, msgChannel, verbose = false, client) {
    if (url.startsWith("<")) url = url.substring(1);
    if (url.endsWith(">")) url = url.substring(0, url.length - 1);
    var id = url.includes("newgrounds")
        ? url.split("/")[5]
        : url.includes("youtube.com/watch?v=")
        ? url.split("=")[1]
        : getFirstResultID(url);
    if (!url.startsWith("http")) {
        url = "https://youtube.com/watch?v=" + id;
        sendWebhook("flaps", url, msgChannel);
    }
    if (fs.existsSync("./audio/yt/" + id + ".mp4")) {
        var filePath = path.join(__dirname, "../audio/yt/", id + ".mp3");
        var message = await client.channels.cache
            .get("956316856422137856")
            .send({
                files: [
                    {
                        attachment: filePath,
                    },
                ],
            });
        sendWebhook("flaps", message.attachments.first().url, msgChannel);
    } else {
        var filePath = path.join(__dirname, "../audio/yt/", id + ".mp3");
        var ytProcess = cp.spawn(
            "yt-dlp",
            (url + " -x --audio-format mp3 -o " + filePath).split(" ")
        );
        ytProcess.stdout.on("data", (data) => {
            //fs.appendFileSync("./audio/yt/log.txt", data.toString());
            if (verbose) sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.stderr.on("data", (data) => {
            sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.on("close", async (code) => {
            if (code == 1) {
                sendWebhook(
                    "flaps",
                    "Error downloading youtube URL.",
                    true,
                    msgChannel
                );
            } else {
                var message = await client.channels.cache
                    .get("956316856422137856")
                    .send({
                        files: [
                            {
                                attachment: filePath,
                            },
                        ],
                    });
                sendWebhook(
                    "flaps",
                    message.attachments.first().url,
                    true,
                    msgChannel
                );
            }
        });
    }
}

function startWatchParty(url, msgChannel) {
    var verbose = false;
    if (url.startsWith("<")) url = url.substring(1);
    if (url.endsWith(">")) url = url.substring(0, url.length - 1);
    var id = url.includes("newgrounds")
        ? url.split("/")[5]
        : url.includes("youtube.com/watch?v=")
        ? url.split("=")[1]
        : getFirstResultID(url);
    if (!url.startsWith("http")) {
        url = "https://youtube.com/watch?v=" + id;
        sendWebhook("flaps", url, msgChannel);
    }
    if (
        fs.existsSync(
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/" + id + ".mp4"
        )
    ) {
        fetch("https://konalt.us.to:4930/start", {
            method: "POST",
            body: JSON.stringify({
                videoId: id,
            }),
            headers: { "Content-Type": "application/json" },
        })
            .then((r) => r.json())
            .then((response) => {
                console.log(response);
                sendWebhook(
                    "flaps",
                    `[yer watch party is ready](https://konalt.us.to/flaps/watchparty/?id=${response.id})\nSponsored by **FlapsCache:tm:**`,
                    true,
                    msgChannel
                );
            });
    } else {
        var filePath =
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/" + id + ".mp4";
        var thumbPath =
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/thumb_" +
            id +
            ".png";
        var ytProcess = cp.spawn(
            "yt-dlp",
            (url + " -f mp4 -o " + filePath).split(" ")
        );
        ytProcess.stdout.on("data", (data) => {
            //fs.appendFileSync("./audio/yt/log.txt", data.toString());
            if (verbose) sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.stderr.on("data", (data) => {
            sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.on("close", async (code) => {
            if (code == 1) {
                sendWebhook(
                    "flaps",
                    "Error downloading youtube URL.",
                    true,
                    msgChannel
                );
            } else {
                download(
                    "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg",
                    thumbPath,
                    () => {
                        fetch("https://konalt.us.to:4930/start", {
                            method: "POST",
                            body: JSON.stringify({
                                videoId: id,
                            }),
                            headers: { "Content-Type": "application/json" },
                        })
                            .then((r) => r.json())
                            .then((response) => {
                                sendWebhook(
                                    "flaps",
                                    `[yer watch party is ready](https://konalt.us.to/flaps/watchparty/?id=${response.id})\nYour video is now in **FlapsCache:tm:**! It will load INSTANTLY the next time!\nThank you for using **FlapsCache:tm:**`,
                                    true,
                                    msgChannel
                                );
                            });
                    }
                );
            }
        });
    }
}

function wpAddToQueue(url, wpId, msgChannel) {
    var verbose = false;
    if (url.startsWith("<")) url = url.substring(1);
    if (url.endsWith(">")) url = url.substring(0, url.length - 1);
    var id = url.includes("newgrounds")
        ? url.split("/")[5]
        : url.includes("youtube.com/watch?v=")
        ? url.split("=")[1]
        : getFirstResultID(url);
    if (!url.startsWith("http")) {
        url = "https://youtube.com/watch?v=" + id;
        sendWebhook("flaps", url, msgChannel);
    }
    if (
        fs.existsSync(
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/" + id + ".mp4"
        )
    ) {
        fetch("https://konalt.us.to:4930/start", {
            method: "POST",
            body: JSON.stringify({
                videoId: id,
            }),
            headers: { "Content-Type": "application/json" },
        })
            .then((r) => r.json())
            .then((response) => {
                console.log(response);
                sendWebhook("flaps", `added to da queue`, msgChannel);
            });
    } else {
        var filePath =
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/" + id + ".mp4";
        var thumbPath =
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/thumb_" +
            id +
            ".png";
        var ytProcess = cp.spawn(
            "yt-dlp",
            (url + " -f mp4 -o " + filePath).split(" ")
        );
        ytProcess.stdout.on("data", (data) => {
            //fs.appendFileSync("./audio/yt/log.txt", data.toString());
            if (verbose) sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.stderr.on("data", (data) => {
            sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.on("close", async (code) => {
            if (code == 1) {
                sendWebhook(
                    "flaps",
                    "Error downloading youtube URL.",
                    true,
                    msgChannel
                );
            } else {
                download(
                    "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg",
                    thumbPath,
                    () => {
                        fetch("https://konalt.us.to:4930/queue/" + wpId, {
                            method: "POST",
                            body: JSON.stringify({
                                videoId: id,
                            }),
                            headers: { "Content-Type": "application/json" },
                        })
                            .then((r) => r.json())
                            .then(() => {
                                sendWebhook(
                                    "flaps",
                                    `added to da queue`,
                                    true,
                                    msgChannel
                                );
                            });
                    }
                );
            }
        });
    }
}

function wpAddToQueueFile(url, wpId, msgChannel) {
    var verbose = false;
    var id = uuidv4().replace(/-/gi, "");
    if (!url.startsWith("http")) {
        url = "https://youtube.com/watch?v=" + id;
        sendWebhook("flaps", url, msgChannel);
    }
    if (
        fs.existsSync(
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/" + id + ".mp4"
        )
    ) {
        fetch("https://konalt.us.to:4930/start", {
            method: "POST",
            body: JSON.stringify({
                videoId: id,
            }),
            headers: { "Content-Type": "application/json" },
        })
            .then((r) => r.json())
            .then((response) => {
                console.log(response);
                sendWebhook("flaps", `added to da queue`, msgChannel);
            });
    } else {
        var filePath =
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/" + id + ".mp4";
        var thumbPath =
            "E:/MBG/2Site/sites/konalt/flaps/watchparty/videos/thumb_" +
            id +
            ".png";
        var ytProcess = cp.spawn(
            "yt-dlp",
            (url + " -f mp4 -o " + filePath).split(" ")
        );
        ytProcess.stdout.on("data", (data) => {
            //fs.appendFileSync("./audio/yt/log.txt", data.toString());
            if (verbose) sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.stderr.on("data", (data) => {
            sendWebhook("flaps", data.toString(), msgChannel);
        });
        ytProcess.on("close", async (code) => {
            if (code == 1) {
                sendWebhook(
                    "flaps",
                    "Error downloading youtube URL.",
                    true,
                    msgChannel
                );
            } else {
                download(
                    "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg",
                    thumbPath,
                    () => {
                        fetch("https://konalt.us.to:4930/queue/" + wpId, {
                            method: "POST",
                            body: JSON.stringify({
                                videoId: id,
                            }),
                            headers: { "Content-Type": "application/json" },
                        })
                            .then((r) => r.json())
                            .then(() => {
                                sendWebhook(
                                    "flaps",
                                    `added to da queue`,
                                    true,
                                    msgChannel
                                );
                            });
                    }
                );
            }
        });
    }
}

module.exports = {
    downloadYoutube: downloadYoutube,
    getFirstResultID: getFirstResultID,
    downloadYoutubeToMP3: downloadYoutubeToMP3,
    startWatchParty: startWatchParty,
    wpAddToQueue: wpAddToQueue,
    wpAddToQueueFile: wpAddToQueueFile,
};
