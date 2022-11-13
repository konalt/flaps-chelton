const fetch = require("node-fetch");
const { sendWebhookEmbed, sendWebhook } = require("./webhooks");
const download = require("./download");
const Discord = require("discord.js");
const { uuidv4 } = require("./ai");
const fs = require("fs");
const { addError } = require("./analytics");

function randomArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function roulette(msgChannel) {
    var boards = [
        "b",
        "r9k",
        "s4s",
        "vip",
        "bant",
        "v",
        "a",
        "k",
        "gif",
        "aco",
        "r",
        "pol",
    ];
    var board = randomArr(boards);
    fetch("https://a.4cdn.org/" + board + "/threads.json")
        .then((r) => r.json())
        .catch((err) => {
            addError(err);
            sendWebhook("4chanroulette", "Error:\n" + err, msgChannel);
        })
        .then((r) => {
            console.log("line 18");
            var thread = randomArr(randomArr(r).threads);
            fetch(
                    "https://a.4cdn.org/" + board + "/thread/" + thread.no + ".json"
                )
                .then((r) => r.json())
                .then((r) => {
                    console.log("line 21");
                    var post = r.posts[0];
                    if (post.com) {
                        var postText = post.com
                            .replace(/<span class="quote">/gi, "")
                            .replace(/<span class="deadlink">/gi, "")
                            .replace(/&quot;/gi, '"')
                            .replace(/<wbr>/gi, "")
                            .replace(/<br>/gi, "\n")
                            .replace(/<b>/gi, "**")
                            .replace(/<\/b>/gi, "**")
                            .replace(
                                /<span class="fortune" style="color:#[0123456789abcdef]+">/gi,
                                ""
                            )
                            .replace(/<\/span>/gi, "")
                            .replace(/&lt;/gi, "")
                            .replace(/&gt;/gi, ">")
                            .replace(/&#039;/gi, "'");
                        [...postText.matchAll(/&lt;[^ \n]+/gi)].forEach(
                            (match) => {
                                var m = match[0];
                                var link = m.substring("&lt;".length);
                                var link2 = link;
                                if (!link.startsWith("https://") ||
                                    !link.startsWith("https://")
                                ) {
                                    link2 = "http://" + link2;
                                }
                                postText.replace(m, `[${link2}](${link})`);
                            }
                        );
                        [
                            ...postText.matchAll(
                                /<a href="[^ "]+" class="quotelink">>>[0-9]+/gi
                            ),
                        ].forEach((match) => {
                            var m = match[0];
                            var id = m.substring(m.indexOf(">>>") + 3);
                            console.log(id); +
                            postText.replace(
                                m,
                                `[>>${id}](https://boards.4chan.org/${board}/thread/${id})`
                            );
                        });
                        var postTitle = postText.includes("\n") ?
                            postText.split("\n")[0] :
                            postText;
                        var postDesc = postText.includes("\n") ?
                            postText.split("\n").slice(1).join("\n") :
                            "";
                    }
                    var ext = "s.png";
                    fetch(
                            "https://i.4cdn.org/" + board + "/" + post.tim + ext, {
                                method: "HEAD",
                            }
                        )
                        .then((res) => {
                            if (!res.ok) ext = "s.jpg";
                            fetch(
                                    "https://i.4cdn.org/" +
                                    board +
                                    "/" +
                                    post.tim +
                                    ext.substring(1), { method: "HEAD" }
                                )
                                .then((res2) => {
                                    if (res2.ok) ext = ext.substring(1);
                                    var embed = new Discord.MessageEmbed()
                                        .setColor("#00cc66")
                                        .setAuthor({
                                            name: post.name ?
                                                post.name :
                                                "Author",
                                            iconURL: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/v1506977414/y31m3uyt8lskvx7rlmjo.png",
                                        })
                                        .addFields({
                                                name: "Replies",
                                                value: (post.replies ?
                                                    post.replies :
                                                    0
                                                ).toString(),
                                                inline: true,
                                            }, {
                                                name: "With images",
                                                value: (post.images ?
                                                    post.images :
                                                    0
                                                ).toString(),
                                                inline: true,
                                            }, {
                                                name: "Users in thread",
                                                value: (post.images ?
                                                    post.images :
                                                    0
                                                ).toString(),
                                                inline: true,
                                            }, {
                                                name: "Board",
                                                value: "/" + board + "/",
                                                inline: true,
                                            }, {
                                                name: "Post No.",
                                                value: post.no ?
                                                    post.no.toString() :
                                                    "Error",
                                                inline: true,
                                            },
                                            post.country_name ?
                                            {
                                                name: "Poster Country",
                                                value: post.country_name,
                                                inline: true,
                                            } :
                                            {
                                                name: "_ _",
                                                value: "_ _",
                                                inline: true,
                                            }
                                        )
                                        .setURL(
                                            "https://boards.4chan.org/" +
                                            board +
                                            "/thread/" +
                                            thread.no
                                        )
                                        .setFooter({
                                            text: "Filename: " +
                                                post.filename +
                                                post.ext,
                                        })
                                        .setImage(
                                            "https://i.4cdn.org/" +
                                            board +
                                            "/" +
                                            post.tim +
                                            ext
                                        );
                                    if (post.com && postDesc.length > 0)
                                        embed.setDescription(
                                            postDesc.substring(0, 2048).trim()
                                        );
                                    if (post.com)
                                        embed.setTitle(
                                            postTitle.substring(0, 256).trim()
                                        );
                                    sendWebhookEmbed(
                                        "4chanroulette",
                                        embed,
                                        msgChannel
                                    );
                                })
                                .catch((err) => {
                                    addError(err);
                                    sendWebhook(
                                        "4chanroulette",
                                        "Error:\n" + err,
                                        false,
                                        msgChannel
                                    );
                                });
                        })
                        .catch((err) => {
                            addError(err);
                            sendWebhook(
                                "4chanroulette",
                                "Error:\n" + err,
                                msgChannel
                            );
                        });
                })
                .catch((err) => {
                    addError(err);
                    sendWebhook("4chanroulette", "Error:\n" + err, msgChannel);
                });
        })
        .catch((err) => {
            addError(err);
            sendWebhook("4chanroulette", "Error:\n" + err, msgChannel);
        });
}

/**
 *
 * @param {Discord.Message} msg
 */

async function fineart(msg) {
    var id = uuidv4() + ".jpg";
    download(msg.attachments.first().url, "images/cache/" + id, () => {
        fs.readFile(
            "images/cache/" + id, { encoding: "base64" },
            (_err, data) => {
                fetch("https://www.instapainting.com/updates/create-chunked/", {
                        credentials: "include",
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0",
                            Accept: "*/*",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Content-Type": "multipart/form-data; boundary=---------------------------350767340815892917253934287128",
                            "Sec-Fetch-Dest": "empty",
                            "Sec-Fetch-Mode": "cors",
                            "Sec-Fetch-Site": "same-origin",
                        },
                        referrer: "https://www.instapainting.com/assets",
                        body: '-----------------------------350767340815892917253934287128\r\nContent-Disposition: form-data; name="name"\r\n\r\n__flaps__.jpg\r\n-----------------------------350767340815892917253934287128\r\nContent-Disposition: form-data; name="chunk"\r\n\r\n0\r\n-----------------------------350767340815892917253934287128\r\nContent-Disposition: form-data; name="chunks"\r\n\r\n1\r\n-----------------------------350767340815892917253934287128\r\nContent-Disposition: form-data; name="file"; filename="blob"\r\nContent-Type: application/octet-stream\r\n\r\n' +
                            data.toString() +
                            "\r\n-----------------------------350767340815892917253934287128--\r\n",
                        method: "POST",
                        mode: "cors",
                    })
                    .then((r) => {
                        return r.text();
                    })
                    .then((x) => {
                        sendWebhook("flaps", x, msg.channel);
                    });
            }
        );
    });
}

/**
 * @type {Discord.Client}
 */
var client;

function setClient(c) {
    client = c;
}

function randomRedditImage(sub, bot, msg) {
    fetch("https://www.reddit.com/r/" + sub + "/.json?limit=100")
        .then((r) => r.json())
        .then((r) => {
            var images = r.data.children
                .filter((p) => {
                    return (
                        p.data.post_hint == "image" &&
                        p.data.url_overridden_by_dest
                    );
                })
                .map((p) => {
                    return p.data.url_overridden_by_dest;
                });
            var item = randomArr(images);
            console.log(item);
            var id = uuidv4() + ".jpg";
            download(item, "images/cache/" + id, async() => {
                var message = await client.channels.cache
                    .get("956316856422137856")
                    .send({
                        files: [{
                            attachment: __dirname + "\\..\\images\\cache\\" + id,
                        }, ],
                    });

                setTimeout(() => {
                    fs.unlinkSync("./images/cache/" + id);
                }, 10000);

                sendWebhook(bot, message.attachments.first().url, msg.channel);
            });
        });
}

module.exports = {
    roulette: roulette,
    fineart: fineart,
    randomRedditImage: randomRedditImage,
    setClient: setClient,
};