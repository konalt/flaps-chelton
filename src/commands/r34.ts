import fetch from "node-fetch";
import { downloadPromise } from "../lib/download";
import { getFileName, makeMessageResp, sample, uuidv4 } from "../lib/utils";
import { FlapsCommand } from "../types";

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        nbsp: " ",
        amp: "&",
        quot: '"',
        lt: "<",
        gt: ">",
    };
    return encodedString
        .replace(translate_re, function (match, entity) {
            return translate[entity];
        })
        .replace(/&#(\d+);/gi, function (match, numStr) {
            var num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
}

function getR34Comments(postId) {
    return new Promise((res, rej) => {
        if (!postId) return res("[No comments on this post]");
        fetch("https://rule34.xxx/index.php?page=post&s=view&id=" + postId)
            .then((r) => r.text())
            .then((r) => {
                var comments = r
                    .split('<div id="comment-list">')[1]
                    .split('<div class="col2">')
                    .slice(1)
                    .map((c) => {
                        return decodeEntities(c.trim().split("\n")[0]);
                    })
                    .filter((c) => {
                        return !c.includes("~");
                    })
                    .join("\n");
                if (!comments) return res("[No comments on this post]");
                res(comments);
            })
            .catch((e) => {
                rej(e);
            });
    });
}

module.exports = {
    id: "r34",
    name: "R34",
    desc: "You know what this command does. We all know what this command does.",
    aliases: ["r34comments", "r34video", "r34commentsvideo"],
    execute(args, buf, msg) {
        return new Promise((res) => {
            if (Math.random() < 0.1) {
                return res(
                    makeMessageResp(
                        "welldressed",
                        "https://media.discordapp.net/attachments/956316856422137856/982985131151228928/88324f31a1fe4aa3a4568285e8771de6.png"
                    )
                );
            }
            var x = "";
            if (args[0]) {
                x = msg.content.split(" ").slice(1).join("_");
            } else {
                x = "calamitas";
            }
            x = x.replace(/,/g, " ");
            if (
                x.includes("child") ||
                x.includes("hat_kid") ||
                x.includes("a_hat")
            ) {
                return res(
                    makeMessageResp(
                        "runcling",
                        "🚔🚔🚔🚔🚨🚨🚨🚨🚨🚓🚓🚓🚓👮‍♀️👮‍♂️👮‍♂️👮‍♂️👮‍♂️👮👮‍♂️👮‍♂️🚓🚨👮‍♀️👮‍♂️👮‍♀️🚓🚔🚨"
                    )
                );
            }
            fetch(
                "https://rule34.xxx/public/autocomplete.php?q=" +
                    x.replace(/'/g, "&#039;"),
                {
                    headers: {
                        "User-Agent": "FlapsChelton",
                        Accept: "*/*",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                    },
                    method: "GET",
                }
            )
                .then((ra) => {
                    return ra.json();
                })
                .then((ra) => {
                    if (!ra[0] && !x.includes(" ")) {
                        return res(
                            makeMessageResp(
                                "runcling",
                                "go outside horny runcling\nhttps://media.discordapp.net/attachments/882743320554643476/982983490075254784/unknown.png"
                            )
                        );
                    }
                    ra = ra.filter((z: any) =>
                        z.label.replace(/&#039;/g, "'").startsWith(x)
                    );
                    /* if (!ra[0]) {
                    return sendWebhook(
                        "runcling",
                        "go inside horny runcling\n😫8====✊===D💦💦",
                        false,
                        msg.channel
                    );
                } */
                    fetch(
                        "https://rule34.xxx/index.php?page=post&s=list&tags=" +
                            (x.includes(" ") ? x : ra[0].value)
                    )
                        .then((r) => {
                            return r.text();
                        })
                        .then((r) => {
                            if (!r.split('<div class="image-list">')[1]) {
                                return res(
                                    makeMessageResp(
                                        "runcling",
                                        "go outside horny runcling\nhttps://media.discordapp.net/attachments/882743320554643476/982983490075254784/unknown.png"
                                    )
                                );
                            }
                            var list = r
                                .split('<div class="image-list">')[1]
                                .split('<div id="paginator">')[0]
                                .split(
                                    /<\/a>\n<\/span>\n<span id="s[0-9]*" class="thumb">\n<a id="p[0-9]*" href="[A-z\.\&\?\=0-9]*" style="">/gi
                                );
                            list = list.filter((item) => {
                                return (
                                    item.startsWith("\n<img s") &&
                                    (msg.content.split(" ")[0].includes("video")
                                        ? item.includes(
                                              "border: 3px solid #0000ff;"
                                          )
                                        : true)
                                );
                            });

                            let list2: [string, boolean][] = list.map(
                                (item) => {
                                    return [
                                        item.substring(
                                            '<img src="'.length + 1,
                                            "https://wimg.rule34.xxx/thumbnails/5074/thumbnail_d3b24d47c2ac59b0c0f2d04319ec240e.jpg?5784441"
                                                .length +
                                                '<img src="'.length +
                                                1
                                        ),
                                        item.includes(
                                            "border: 3px solid #0000ff;"
                                        ),
                                    ];
                                }
                            );
                            let list3: [string, boolean][] = list2.map(
                                (item) => {
                                    return [
                                        item[0].replace(
                                            /thumbnail/g,
                                            "thumbnail"
                                        ),
                                        item[1],
                                    ];
                                }
                            );

                            let used: string[] = [];

                            if (
                                list3.filter((item) => {
                                    return !used.includes(item[0]);
                                }).length == 0 &&
                                list3.length > 0
                            )
                                used = [];

                            let list4 = list3.filter((item) => {
                                return !used.includes(item[0]);
                            });
                            var item = sample(list4);
                            var id = uuidv4() + ".jpg";
                            if (!item) {
                                return res(
                                    makeMessageResp(
                                        "runcling",
                                        "go outside horny runcling\nhttps://media.discordapp.net/attachments/882743320554643476/982983490075254784/unknown.png"
                                    )
                                );
                            }
                            used.push(item[0]);
                            var isVideoStr = item[1]
                                ? "Video: YES"
                                : "Video: NO";
                            if (
                                item[1] &&
                                msg.content.split(" ")[0].includes("video")
                            ) {
                                id = uuidv4() + ".mp4";
                                var videoURL =
                                    "https://ws-cdn-video.rule34.xxx/images/" +
                                    item[0].split("/")[4] +
                                    "/" +
                                    item[0]
                                        .split("_")[1]
                                        .replace(/(png|jpe*g)/g, "mp4");
                                downloadPromise(videoURL).then((b) => {
                                    getR34Comments(item[0].split("?")[1]).then(
                                        (comments) => {
                                            if (
                                                !msg.content
                                                    .split(" ")[0]
                                                    .includes("comments")
                                            )
                                                comments = "";
                                            return res(
                                                makeMessageResp(
                                                    "runcling",
                                                    comments +
                                                        "\n" +
                                                        isVideoStr,
                                                    null,
                                                    b,
                                                    getFileName("R34", "mp4")
                                                )
                                            );
                                        }
                                    );
                                });
                            } else {
                                console.log(item);

                                downloadPromise(item[0]).then((b) => {
                                    getR34Comments(item[0].split("?")[1]).then(
                                        (comments) => {
                                            if (
                                                !msg.content
                                                    .split(" ")[0]
                                                    .includes("comments")
                                            )
                                                comments = "";
                                            return res(
                                                makeMessageResp(
                                                    "runcling",
                                                    comments +
                                                        "\n" +
                                                        isVideoStr,
                                                    null,
                                                    b,
                                                    getFileName("R34", "png")
                                                )
                                            );
                                        }
                                    );
                                });
                            }
                        });
                });
        });
    },
} satisfies FlapsCommand;
