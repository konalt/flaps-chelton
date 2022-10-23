const { sendWebhook, sendWebhookFile } = require("./webhooks");
const fs = require("fs");
const canvas = require("canvas");
const path = require("path");
const download = require("./download");
const { cahWhiteCard } = require("./cardsagainsthumanity");
const { createCanvas, Image } = require("canvas");
const { loadImage } = require("canvas");
const { uuidv4 } = require("./util");

var memeMaking = {
    getImageData: async function(n) {
        if (!this.imageExists(n)) {
            n = "farquaad";
        }
        return fs
            .readFileSync("./images/sizes.txt")
            .toString()
            .split("\r\n")
            .filter((l) => {
                return l.split(" ")[0] == n;
            })[0]
            .split(" ");
    },
    imageExists: function(n) {
        var o = !!fs
            .readFileSync("./images/sizes.txt")
            .toString()
            .split("\r\n")
            .find((l) => {
                return l.split(" ")[0] == n;
            });
        return o;
    },
};

function laugh(msg, client) {
    var image =
        msg.content.substring("!laugh ".length).length == 0 ?
        "farquaad" :
        msg.content.substring("!laugh ".length).split(" ")[0];
    if (image == "attachment" && msg.attachments.first()) {
        console.log("[laugh] Laugh attachment");
        var id = uuidv4();
        download(msg.attachments.first().url, "images/cache/" + id, () => {
            console.log("[laugh] Downloaded attachment");
            image = "cache/" + id;
            var data = [
                "cache/" + id,
                msg.attachments.first().width.toString(),
                msg.attachments.first().height.toString(),
                (msg.attachments.first().height / 10).toString(),
                "D",
                "D",
                "D",
                "D",
            ];
            console.log("[laugh] data");
            console.log(data);
            var c = canvas.createCanvas(parseInt(data[1]), parseInt(data[2]));
            var ctx = c.getContext("2d");
            var text = msg.content.split(" ").slice(2).join(" ");

            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.textAlign = "center";

            canvas
                .loadImage(__dirname + "./../images\\" + image)
                .then(async(i) => {
                    ctx.font = "normal normal bolder" + data[3] + "px Impact";
                    ctx.lineWidth = parseInt(data[3]) / 30;
                    var text1Pos = [0, 0];
                    var text2Pos = [0, 0];
                    if (data[4] == "D") {
                        text1Pos[0] = parseInt(data[1]) / 2;
                    } else {
                        text1Pos[0] = parseInt(data[4]);
                    }
                    if (data[5] == "D") {
                        text1Pos[1] = parseInt(data[3]);
                    } else if (data[5] == "B") {
                        text1Pos[1] = parseInt(data[2]) - 10;
                    } else {
                        text1Pos[1] = parseInt(data[5]);
                    }
                    if (data[6] == "D") {
                        text2Pos[0] = parseInt(data[1]) / 2;
                    } else {
                        text2Pos[0] = parseInt(data[6]);
                    }
                    if (data[7] == "D") {
                        text2Pos[1] = parseInt(data[2]) - 10;
                    } else if (data[7] == "T") {
                        text2Pos[1] = parseInt(data[3]);
                    } else {
                        text2Pos[1] = parseInt(data[7]);
                    }
                    ctx.drawImage(
                        i,
                        0,
                        0,
                        parseInt(data[1]),
                        parseInt(data[2])
                    );
                    if (text.includes(":")) {
                        text = [text.split(":")[0], text.split(":")[1]];
                    } else {
                        text = [text, ""];
                    }
                    ctx.fillText(text[0], text1Pos[0], text1Pos[1]);
                    ctx.strokeText(text[0], text1Pos[0], text1Pos[1]);
                    ctx.fillText(text[1], text2Pos[0], text2Pos[1]);
                    ctx.strokeText(text[1], text2Pos[0], text2Pos[1]);

                    console.log("[laugh] Sending canvas");
                    sendCanvas(c, msg, client, "jamesphotoframe");
                });
        });
    } else {
        var text;
        console.log("[laugh] random checks and shit");
        if (
            memeMaking.imageExists(
                msg.content.substring("!laugh ".length).split(" ")[0]
            )
        ) {
            console.log("[laugh] pos1");
            text =
                msg.content.substring("!laugh ".length).length == 0 ?
                "" :
                msg.content.substring(
                    "!laugh ".length + image.length + 1
                );
        } else {
            console.log("[laugh] pos2");
            image = "farquaad";
            text =
                msg.content.substring("!laugh ".length).length == 0 ?
                "" :
                msg.content.substring("!laugh ".length);
        }
        console.log("[laugh] mm keep going");
        memeMaking.getImageData(image).then((data) => {
            console.log(parseInt(data[1]), parseInt(data[2]));
            var c = canvas.createCanvas(parseInt(data[1]), parseInt(data[2]));
            var ctx = c.getContext("2d");

            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.textAlign = "center";

            canvas
                .loadImage(__dirname + "./../images\\" + image + ".jpg")
                .then(async(i) => {
                    ctx.font = "normal normal bolder" + data[3] + "px Impact";
                    ctx.lineWidth = parseInt(data[3]) / 30;
                    var text1Pos = [0, 0];
                    var text2Pos = [0, 0];
                    if (data[4] == "D") {
                        text1Pos[0] = parseInt(data[1]) / 2;
                    } else {
                        text1Pos[0] = parseInt(data[4]);
                    }
                    if (data[5] == "D") {
                        text1Pos[1] = parseInt(data[3]);
                    } else if (data[5] == "B") {
                        text1Pos[1] = parseInt(data[2]) - 10;
                    } else {
                        text1Pos[1] = parseInt(data[5]);
                    }
                    if (data[6] == "D") {
                        text2Pos[0] = parseInt(data[1]) / 2;
                    } else {
                        text2Pos[0] = parseInt(data[6]);
                    }
                    if (data[7] == "D") {
                        text2Pos[1] = parseInt(data[2]) - 10;
                    } else if (data[7] == "T") {
                        text2Pos[1] = parseInt(data[3]);
                    } else {
                        text2Pos[1] = parseInt(data[7]);
                    }
                    ctx.drawImage(
                        i,
                        0,
                        0,
                        parseInt(data[1]),
                        parseInt(data[2])
                    );
                    if (text.includes(":")) {
                        text = [text.split(":")[0], text.split(":")[1]];
                    } else {
                        text = [text, ""];
                    }
                    ctx.fillText(text[0], text1Pos[0], text1Pos[1]);
                    ctx.strokeText(text[0], text1Pos[0], text1Pos[1]);
                    ctx.fillText(text[1], text2Pos[0], text2Pos[1]);
                    ctx.strokeText(text[1], text2Pos[0], text2Pos[1]);

                    console.log("[laugh] sending canvas");
                    sendCanvas(c, msg, client, "jamesphotoframe");
                });
        });
    }
}

function todo(ctx, text, w, h, fontSize, cx, cy) {
    var max_width = w;
    var lines = new Array();
    var width = 0,
        i,
        j;
    var result;

    // Start calculation
    while (text.length) {
        for (
            i = text.length; ctx.measureText(text.substr(0, i)).width > max_width; i--
        );

        result = text.substr(0, i);

        if (i !== text.length)
            for (
                j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1
            );

        lines.push(result.substr(0, j || result.length));
        width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
        text = text.substr(lines[lines.length - 1].length, text.length);
    }

    var textH = cy;
    textH -= (lines.length * fontSize + (fontSize + 5)) / 2;
    textH += fontSize / 2;

    for (i = 0, j = lines.length; i < j; ++i) {
        ctx.fillText(lines[i], cx, textH + fontSize + (fontSize + 5) * i);
        ctx.strokeText(lines[i], cx, textH + fontSize + (fontSize + 5) * i);
    }
}

function homodog(msg, client) {
    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
    var text = msg.content.split(" ").slice(1).join(" ");
    var id = uuidv4();

    function doThing(imgid, w, h) {
        var c = canvas.createCanvas(w, h);
        var ctx = c.getContext("2d");
        canvas
            .loadImage(path.join(__dirname, "..", "images", imgid))
            .then(async(photo) => {
                ctx.drawImage(photo, 0, 0, w, h);

                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.textAlign = "center";
                ctx.font = "normal normal bolder " + h / 7 + "px Homodog";
                ctx.lineWidth = h / 240;

                todo(ctx, text, w, h, h / 7, w / 2, h / 2);

                sendCanvas(c, msg, client, "jamesphotoframe");
            });
    }
    if (msg.attachments.first()) {
        download(msg.attachments.first().url, "images/cache/" + id, () => {
            doThing(
                "cache/" + id,
                msg.attachments.first().width,
                msg.attachments.first().height
            );
        });
    } else {
        doThing("homophobicdog.png", 1024, 1024);
    }
}

function flip(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    var w = msg.attachments.first().width;
                    var h = msg.attachments.first().height;
                    var c = canvas.createCanvas(w, h);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage(__dirname + "./../images\\cache\\" + imgID)
                        .then(async(photo) => {
                            ctx.translate(w, 0);
                            ctx.scale(-1, 1);
                            ctx.drawImage(photo, 0, 10, w, h);

                            sendCanvas(c, msg, client, "jamesphotoframe");
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant put a speech bubble on nothing you dummy",
            false,
            msg.channel
        );
    }
}

function getAngleArbitrary(x, y, x2, y2) {
    let gameY = y2;
    let gameX = x2;
    let mouseY = y;
    let mouseX = x;
    let theta = 0;

    if (mouseX > gameX) {
        theta =
            (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) / Math.PI;
    } else if (mouseX < gameX) {
        theta =
            180 +
            (Math.atan((gameY - mouseY) / (gameX - mouseX)) * 180) / Math.PI;
    } else if (mouseX == gameX) {
        if (mouseY > gameY) {
            theta = 90;
        } else {
            theta = 270;
        }
    }

    return Math.round(theta);
}

function spotted(msg, client) {
    if (msg.attachments.first(2)[1]) {
        var request = require("request").defaults({ encoding: null });

        var atts = msg.attachments.first(2);
        request.get(atts[0].url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                var imageStream = Buffer.from(body, "base64");
                var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                fs.writeFileSync("../images/cache/" + imgID, imageStream);
                request.get(atts[1].url, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                        var imageStream2 = Buffer.from(body, "base64");
                        var imgID2 = uuidv4().replace(/-/g, "_") + ".jpg";
                        fs.writeFileSync(
                            "../images/cache/" + imgID2,
                            imageStream2
                        );
                        var w = atts[0].width;
                        var h = atts[0].height;
                        var c = canvas.createCanvas(w, h);
                        var ctx = c.getContext("2d");
                        canvas
                            .loadImage("./../images\\cache\\" + imgID)
                            .then(async(photo1) => {
                                canvas
                                    .loadImage("./../images\\cache\\" + imgID2)
                                    .then(async(photo2) => {
                                        ctx.drawImage(photo1, 0, 0, w, h);
                                        var positions = [
                                            [w / 8, w / 8],
                                            [w - w / 8, w / 8],
                                            [w / 8, h - w / 8],
                                            [w - w / 8, h - w / 8],
                                        ];
                                        var pos1 =
                                            positions[
                                                Math.floor(
                                                    Math.random() *
                                                    positions.length
                                                )
                                            ];
                                        var ang = getAngleArbitrary(
                                            pos1[0],
                                            pos1[1],
                                            w / 2,
                                            h / 2
                                        );
                                        ctx.drawImage(
                                            photo2,
                                            pos1[0] - w / 8,
                                            pos1[1] - w / 8,
                                            w / 4,
                                            w / 4
                                        );
                                        ctx.beginPath();
                                        ctx.arc(
                                            pos1[0],
                                            pos1[1],
                                            w / 8,
                                            0,
                                            2 * Math.PI
                                        );
                                        ctx.strokeStyle = "red";
                                        ctx.lineWidth = w / 8 / 16;
                                        ctx.stroke();
                                        ctx.translate(pos1[0], pos1[1]);
                                        ctx.rotate((ang * Math.PI) / 180);
                                        ctx.translate(-pos1[0], -pos1[1]);
                                        ctx.beginPath();
                                        ctx.moveTo(pos1[0], pos1[1] + w / 8);
                                        ctx.lineTo(
                                            pos1[0],
                                            pos1[1] + w / 8 + w / 2
                                        );
                                        ctx.stroke();
                                        ctx.setTransform(1, 0, 0, 1, 0, 0);

                                        sendCanvas(
                                            c,
                                            msg,
                                            client,
                                            "jamesphotoframe"
                                        );
                                    });
                            });
                    } else {
                        sendWebhook(
                            "jamesphotoframe",
                            error,
                            true,
                            msg.channel
                        );
                    }
                });
            } else {
                sendWebhook("jamesphotoframe", error, msg.channel);
            }
        });
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant put a speech bubble on nothing you dummy",
            false,
            msg.channel
        );
    }
}

function valueInRange(val, min, max) {
    return val >= min && val <= max;
}

function isWhite(pix, cutoff) {
    cutoff = 255 - cutoff;
    return pix[0] > cutoff && pix[1] > cutoff && pix[2] > cutoff;
}

function isBlack(pix, cutoff) {
    return pix[0] < cutoff && pix[1] < cutoff && pix[2] < cutoff;
}

function isGray(pix, cutoff) {
    var redGreen = valueInRange(pix[0], pix[1] - cutoff, pix[1] + cutoff);
    var redBlue = valueInRange(pix[0], pix[2] - cutoff, pix[2] + cutoff);
    return redGreen && redBlue;
}

function unfunnyToImg(ctx, img, unfunnyCutoff = 10) {
    var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    var readIndex = 0;
    var curPix = [-1, -1, -1, -1];
    var imageData2 = [];
    var backgroundCanvas = canvas.createCanvas(
        ctx.canvas.width,
        ctx.canvas.height
    );
    var bgCtx = backgroundCanvas.getContext("2d");
    bgCtx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    var bg = bgCtx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    Array.from(imageData.data).forEach((element, index) => {
        curPix[readIndex] = element;
        if (!curPix.includes(-1)) {
            if (!isBlack(curPix, unfunnyCutoff) &&
                !isWhite(curPix, unfunnyCutoff) &&
                !isGray(curPix, unfunnyCutoff)
            ) {
                curPix = [
                    bg.data[index - 3],
                    bg.data[index - 2],
                    bg.data[index - 1],
                    bg.data[index],
                ];
            }
        }
        readIndex++;
        if (readIndex == 4) {
            imageData2.push([...curPix]);
            curPix = [-1, -1, -1, -1];
            readIndex = 0;
        }
    });
    var imageData3 = [];
    imageData2.forEach((pixel) => {
        imageData3.push(pixel[0]);
        imageData3.push(pixel[1]);
        imageData3.push(pixel[2]);
        imageData3.push(pixel[3]);
    });
    var imageData4 = new canvas.ImageData(
        new Uint8ClampedArray(imageData3),
        ctx.canvas.width,
        ctx.canvas.height
    );
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData4, 0, 0);
}

function unfunnyTest(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var w = msg.attachments.first().width;
                    var h = msg.attachments.first().height;
                    var c = canvas.createCanvas(w, h);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage(path.join("..", "images/cache/", imgID))
                        .then(async(photo) => {
                            ctx.drawImage(photo, 0, 0);
                            var imgs = [
                                "saul",
                                "gman",
                                "homophobicdog",
                                "iron",
                                "killnow",
                            ];
                            unfunnyToImg(
                                ctx,
                                await canvas.loadImage(
                                    pj(
                                        imgs[
                                            Math.floor(
                                                Math.random() * imgs.length
                                            )
                                        ] + ".png"
                                    )
                                ),
                                msg.content.split(" ")[1] ?
                                parseInt(msg.content.split(" ")[1]) :
                                5
                            );

                            sendCanvas(c, msg, client, "jamesphotoframe");
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant put a speech bubble on nothing you dummy",
            false,
            msg.channel
        );
    }
}

function sb(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var w = msg.attachments.first().width;
                    var h = msg.attachments.first().height;
                    var c = canvas.createCanvas(w, h + 10);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage(path.join("..", "images/cache/", imgID))
                        .then(async(photo) => {
                            canvas
                                .loadImage(pj("speech.png"))
                                .then(async(speechbubble) => {
                                    var sbHeight = w * (17 / 22);
                                    ctx.drawImage(photo, 0, 10, w, h);
                                    if (msg.content.includes("flip")) {
                                        ctx.translate(w, 0);
                                        ctx.scale(-1, 1);
                                    }
                                    ctx.drawImage(
                                        speechbubble,
                                        0, -(sbHeight - sbHeight / 3),
                                        w,
                                        sbHeight
                                    );

                                    sendCanvas(
                                        c,
                                        msg,
                                        client,
                                        "jamesphotoframe"
                                    );
                                });
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant put a speech bubble on nothing you dummy",
            false,
            msg.channel
        );
    }
}

function frame(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var c = canvas.createCanvas(1413 - 130, 1031 - 140);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage("./../images/cache/" + imgID)
                        .then(async(photo) => {
                            canvas
                                .loadImage(
                                    path.join(
                                        __dirname,
                                        "..",
                                        "images",
                                        "frame.png"
                                    )
                                )
                                .then(async(frame) => {
                                    ctx.drawImage(photo, 72, 73, 1125, 729);
                                    ctx.drawImage(
                                        frame, -130 / 2, -140 / 2,
                                        1413,
                                        1031
                                    );

                                    sendCanvas(
                                        c,
                                        msg,
                                        client,
                                        "jamesphotoframe"
                                    );
                                });
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant frame nothing you dummy",
            false,
            msg.channel
        );
    }
}

function pj(fn) {
    return path.join(__dirname, "..", "images", fn);
}

function frame2(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            async function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                    var w = msg.attachments.first().width;
                    var h = msg.attachments.first().height;
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var fsize = 90;
                    var c = canvas.createCanvas(w + fsize * 2, h + fsize * 2);
                    var ctx = c.getContext("2d");

                    var frame_tl = await canvas.loadImage(
                            pj("framecorner_topleft.png")
                        ),
                        frame_tr = await canvas.loadImage(
                            pj("framecorner_topright.png")
                        ),
                        frame_br = await canvas.loadImage(
                            pj("framecorner_bottomright.png")
                        ),
                        frame_bl = await canvas.loadImage(
                            pj("framecorner_bottomleft.png")
                        ),
                        frame_l = await canvas.loadImage(
                            pj("frameside_left.png")
                        ),
                        frame_r = await canvas.loadImage(
                            pj("frameside_right.png")
                        ),
                        frame_t = await canvas.loadImage(
                            pj("frameside_top.png")
                        ),
                        frame_b = await canvas.loadImage(
                            pj("frameside_bottom.png")
                        ),
                        img = await canvas.loadImage(
                            "./../images/cache/" + imgID
                        );

                    ctx.drawImage(frame_tl, 0, 0, fsize, fsize);
                    ctx.drawImage(frame_t, fsize, 0, w, fsize);
                    ctx.drawImage(frame_tr, w + fsize, 0, fsize, fsize);
                    ctx.drawImage(frame_r, w + fsize, fsize, fsize, h);
                    ctx.drawImage(frame_br, w + fsize, h + fsize, fsize, fsize);
                    ctx.drawImage(frame_b, fsize, h + fsize, w, fsize);
                    ctx.drawImage(frame_bl, 0, h + fsize, fsize, fsize);
                    ctx.drawImage(frame_l, 0, fsize, fsize, h);

                    ctx.drawImage(img, fsize, fsize, w, h);

                    sendCanvas(c, msg, client, "jamesphotoframe");
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant frame nothing you dummy",
            false,
            msg.channel
        );
    }
}

function dalle2watermark(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                    var w = msg.attachments.first().width;
                    var h = msg.attachments.first().height;
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var c = canvas.createCanvas(w, h);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage("./../images/cache/" + imgID)
                        .then(async(photo) => {
                            canvas
                                .loadImage(
                                    path.join(
                                        __dirname,
                                        "..",
                                        "images",
                                        "dalle2.png"
                                    )
                                )
                                .then(async(wm) => {
                                    ctx.drawImage(photo, 0, 0, w, h);
                                    var dalle = {
                                        w: w * (80 / 1024),
                                        h: w * (16 / 1024),
                                    };
                                    ctx.drawImage(
                                        wm,
                                        w - dalle.w,
                                        h - dalle.h,
                                        dalle.w,
                                        dalle.h
                                    );

                                    sendCanvas(
                                        c,
                                        msg,
                                        client,
                                        "jamesphotoframe"
                                    );
                                });
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant frame nothing you dummy",
            false,
            msg.channel
        );
    }
}

function animethink(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var c = canvas.createCanvas(499, 442);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage("./../images/cache/" + imgID)
                        .then(async(photo) => {
                            canvas
                                .loadImage(
                                    path.join(
                                        __dirname,
                                        "..",
                                        "images",
                                        "animethink.png"
                                    )
                                )
                                .then(async(think) => {
                                    ctx.drawImage(photo, 0, 0, 499, 241);
                                    ctx.drawImage(think, 0, 0, 499, 442);
                                    sendCanvas(
                                        c,
                                        msg,
                                        client,
                                        "jamesphotoframe"
                                    );
                                });
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant frame nothing you dummy",
            false,
            msg.channel
        );
    }
}

function animethink2(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    //sendWebhook("flaps", imageStream.toString("base64").substring(0, 1000), msg.channel);
                    var c = canvas.createCanvas(499, 442);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage("./../images/cache/" + imgID)
                        .then(async(photo) => {
                            canvas
                                .loadImage(
                                    path.join(
                                        __dirname,
                                        "..",
                                        "images",
                                        "anime2.png"
                                    )
                                )
                                .then(async(think) => {
                                    ctx.drawImage(photo, 244, 0, 252, 230);
                                    ctx.drawImage(think, 0, 0, 498, 482);
                                    sendCanvas(
                                        c,
                                        msg,
                                        client,
                                        "jamesphotoframe"
                                    );
                                });
                        });
                } else {
                    sendWebhook("jamesphotoframe", error, msg.channel);
                }
            }
        );
    } else {
        sendWebhook(
            "jamesphotoframe",
            "i cant frame nothing you dummy",
            false,
            msg.channel
        );
    }
}

async function weezer(msg, client) {
    var w = 552;
    var h = w;
    var c = canvas.createCanvas(w, h);
    var ctx = c.getContext("2d");
    var imgID2 = uuidv4() + ".png";
    var weez1 = await canvas.loadImage(pj("weezer1.png")),
        weez2 = await canvas.loadImage(pj("weezer2.png")),
        weez3 = await canvas.loadImage(pj("weezer3.png")),
        weez4 = await canvas.loadImage(pj("weezer4.png"));
    ctx.fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
    var xs = [0, 138, 276, 414];
    var weezes = [weez1, weez2, weez3, weez4];
    var currentIndex = xs.length,
        randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [xs[currentIndex], xs[randomIndex]] = [
            xs[randomIndex],
            xs[currentIndex],
        ];
    }
    var randomImage = weezes[Math.floor(Math.random() * weezes.length)];

    ctx.fillRect(0, 0, w, h);
    if (Math.random() < 0.5) {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(randomImage, 0, 0, w, h);
        ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 4; i++) {
        var randomizer = Math.random() + 0.5;
        var randomizer2 = Math.random() * 0.4 + 0.8;
        if (randomizer > 0.5) {
            ctx.drawImage(
                weezes[Math.floor(Math.random() * weezes.length)],
                xs[i] * randomizer2,
                (h / 3) * randomizer,
                138,
                461 * randomizer
            );
        }
    }

    ctx.fillStyle = "black";
    ctx.font = "bold 48px Weezer";
    var takenIndexes = [];
    var y = Math.floor(Math.random() * 4);
    var texts = [
        "weezer",
        "weezur",
        "winzur",
        "weenis",
        "winblo",
        "amogus",
        "wiener",
        "boogus",
        "spoons",
        "doobus",
    ];
    for (let i = 0; i < y; i++) {
        var chosenText = texts[Math.floor(Math.random() * texts.length)];
        var tw = ctx.measureText(chosenText).width;
        var possibleTextPlaces = [
            [w - tw, 30],
            [0, 30],
            [0, h - 5],
            [w - tw, h - 5],
        ];
        var chosenPlace =
            possibleTextPlaces[
                Math.floor(Math.random() * possibleTextPlaces.length)
            ];
        if (takenIndexes.includes(possibleTextPlaces.indexOf(chosenPlace))) {
            y++;
            continue;
        }
        ctx.fillText(chosenText, chosenPlace[0], chosenPlace[1]);
        takenIndexes.push(possibleTextPlaces.indexOf(chosenPlace));
        texts = texts.filter((t) => {
            return t != chosenText;
        });
    }

    var imageStream2 = Buffer.from(
        c.toDataURL("image/png").split(",")[1],
        "base64"
    );
    fs.writeFileSync("../images/cache/" + imgID2, imageStream2);
    /**
     * @type {Discord.Message}
     */
    var message = await client.channels.cache.get("956316856422137856").send({
        files: [{
            attachment: "../images\\cache\\" + imgID2,
        }, ],
    });

    setTimeout(() => {
        fs.unlinkSync("../images/cache/" + imgID2);
    }, 10000);

    sendWebhook("custom", message.attachments.first().url, msg.channel, {
        username: "weezer",
        avatar: message.attachments.first().url,
        content: message.attachments.first().url,
    });
}

async function sendCanvas(c, msg, client, botname) {
    var imgID2 = uuidv4() + ".png";
    var imageStream2 = Buffer.from(
        c.toDataURL("image/png").split(",")[1],
        "base64"
    );
    fs.writeFileSync("../images/cache/" + imgID2, imageStream2);
    sendWebhookFile(botname, "../images\\cache\\" + imgID2, msg.channel);
    return;
    /**
     * @type {Discord.Message}
     */
    var message = await client.channels.cache.get("956316856422137856").send({
        files: [{
            attachment: "../images\\cache\\" + imgID2,
        }, ],
    });

    /* setTimeout(() => {
        fs.unlinkSync("../images/cache/" + imgID2);
    }, 10000); */

    sendWebhook(botname, message.attachments.first().url, msg.channel);
}

function getTextWidth(font, fontsize, text) {
    var c = createCanvas(1, 1);
    var ctx = c.getContext("2d");
    ctx.font = fontsize + "px " + font;
    var w = ctx.measureText(text).width;
    return w;
}

function carbs(msg, client, custom = false) {
    var w = 960,
        h = 540,
        fontScaleFactor = 0.09;
    var c = canvas.createCanvas(w, h);
    var ctx = c.getContext("2d");
    var images = [
        "yooo",
        "waow",
        "unbanned",
        "skeleton",
        "wh",
        "iron",
        "millerdaughter",
        "tired",
        "mime",
        "killnow",
        "gman",
        "baseball",
        "whnat",
        "cow",
    ];
    var test = false;
    canvas
        .loadImage(
            __dirname +
            "./../images\\" +
            images[Math.floor(Math.random() * images.length)] +
            ".png"
        )
        .then(async(frame) => {
            ctx.drawImage(frame, 0, 0, w, h);
            var card = cahWhiteCard(custom).replace(/__/g, "");
            ctx.fillStyle = "white";
            ctx.lineWidth = (h * fontScaleFactor) / 25;
            ctx.strokeStyle = "black";
            ctx.textAlign = "center";
            ctx.font =
                "normal normal bolder" + h * fontScaleFactor + "px Impact";
            if (test)
                card =
                "TEST AIFISDHFAJEAFHAIJDFHNSEIFOUHADJIFNBASIEFUHSI CUM CUM CUM CUM CUM CUM CUM CUM CUM CUM";
            ctx.fillText(card, w / 2, h * fontScaleFactor + 10, w);
            ctx.strokeText(card, w / 2, h * fontScaleFactor + 10, w);
            sendCanvas(c, msg, client, "jamesphotoframe");
        });
}

function watermark(msg, client) {
    if (msg.attachments.size > 0) {
        console.log(msg.attachments.first());
        var request = require("request").defaults({ encoding: null });

        request.get(
            msg.attachments.first().url,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    //data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                    var imageStream = Buffer.from(body, "base64");
                    var imgID = uuidv4().replace(/-/g, "_") + ".jpg";
                    var imgID2 = uuidv4().replace(/-/g, "_") + ".png";
                    var w = msg.attachments.first().width;
                    var h = msg.attachments.first().height;
                    fs.writeFileSync("../images/cache/" + imgID, imageStream);
                    var c = canvas.createCanvas(w, h);
                    var ctx = c.getContext("2d");
                    canvas
                        .loadImage("./../images/cache/" + imgID)
                        .then(async(photo) => {
                            canvas
                                .loadImage(
                                    __dirname +
                                    "./../images\\redditwatermark.png"
                                )
                                .then(async(reddit) => {
                                    ctx.drawImage(photo, 0, 0, w, h);

                                    //var amount = Math.floor(Math.random() * 100);
                                    var amount = 75;
                                    var redditwidth = w / 4;
                                    var redditheight = redditwidth;
                                    for (let i = 0; i < amount; i++) {
                                        var x =
                                            Math.floor(Math.random() * w) -
                                            redditwidth / 2;
                                        var y =
                                            Math.floor(Math.random() * h) -
                                            redditheight / 2;
                                        var alpha = Math.random();
                                        var scaleRandomizer =
                                            Math.random() + 0.5;
                                        ctx.globalAlpha = alpha;
                                        ctx.drawImage(
                                            reddit,
                                            x,
                                            y,
                                            redditwidth * scaleRandomizer,
                                            redditheight * scaleRandomizer
                                        );
                                        ctx.globalAlpha = 1;
                                    }

                                    sendCanvas(c, msg, client, "reddit");
                                });
                        });
                }
            }
        );
    }
}

function dog(msg, client) {
    var blue = "rgba(65,156,229,255)";
    var bluetransparent = "rgba(65,156,229,0)";
    var white = "rgba(255,255,255,255)";
    var fac = 0.5;
    if (msg.attachments.first()) {
        var att = msg.attachments.first();
        download(att.url, "dataurl", (err, data) => {
            loadImage(data).then((img) => {
                var c = canvas.createCanvas(att.width, att.height);
                var ctx = c.getContext("2d");
                ctx.drawImage(img, 0, 0);
                var imageData = ctx.getImageData(0, 0, att.width, att.height);
                var d = imageData.data;
                for (var i = 0; i < d.length; i += 4) {
                    var med = (d[i] + d[i + 1] + d[i + 2]) / 3;
                    d[i] = d[i + 1] = d[i + 2] = med;
                }
                ctx.putImageData(imageData, 0, 0);
                var grad2 = ctx.createRadialGradient(
                    att.width / 2,
                    att.height / 2,
                    att.width / 1.2,
                    att.width / 2,
                    att.height / 2,
                    att.width / 10
                );
                grad2.addColorStop(1, "transparent");
                grad2.addColorStop(0, "black");
                ctx.fillStyle = grad2;
                ctx.fillRect(0, 0, att.width, att.height);
                var grad = ctx.createLinearGradient(
                    0,
                    att.height,
                    0,
                    att.height * fac
                );
                grad.addColorStop(1, bluetransparent);
                grad.addColorStop(0, blue);
                ctx.fillStyle = grad;
                ctx.fillRect(
                    0,
                    att.height * fac,
                    att.width,
                    att.height * (1 - fac)
                );
                ctx.fillStyle = white;
                var fontFac = 0.15;
                var fontSize = Math.floor(att.height * fontFac);
                ctx.font = fontSize + "px Fuckedup";
                ctx.textAlign = "center";
                ctx.lineWidth = fontSize * 0.2;
                var text = "this dog is";
                ctx.strokeText(
                    text,
                    att.width / 2,
                    att.height * fac + fontSize
                );
                ctx.fillText(text, att.width / 2, att.height * fac + fontSize);
                sendCanvas(c, msg, client, "dog");
            });
        });
    }
}

async function robertDowneyJunior(msg, client) {
    var text = msg.content.split(" ").slice(1).join(" ");
    if (msg.attachments.first()) {
        var att = msg.attachments.first();
        var w = att.width;
        var h = att.height * 1.5;
        var rdjSize = att.height * 0.45;
        var rdj = await loadImage(__dirname + "./../images\\rdj.png");
        download(att.url, "dataurl", (err, data) => {
            loadImage(data).then((img) => {
                var c = canvas.createCanvas(w, h);
                var ctx = c.getContext("2d");
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0);
                ctx.drawImage(
                    rdj,
                    att.height * 0.025,
                    att.height * 1.025,
                    rdjSize,
                    rdjSize
                );
                ctx.font = h * 0.5 * 0.2 + "px sans-serif";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "transparent";
                ctx.lineWidth = h * 0.5 * 0.2 * 0.1;
                ctx.textAlign = "center";
                ctx.fillText(
                    text,
                    att.height * 0.05 + rdjSize,
                    att.height * 1.025 + rdjSize / 2
                );
                /* todo(
                    ctx,
                    text,
                    w,
                    h,
                    h * 0.5 * 0.2,
                    (att.width - (att.height * 0.05 + rdjSize)) / 2
                ); */
                sendCanvas(c, msg, client, "stuff");
            });
        });
    }
}

async function createCollage(buffers, imgSize) {
    return new Promise((resolve, reject) => {
        var proms = buffers.map((buf) => {
            return new Promise((resolve, reject) => {
                loadImage(buf).then((img) => {
                    resolve(img);
                });
            });
        });
        Promise.all(proms).then((imgs) => {
            var w = imgSize * (imgs.length / 2);
            var h = imgSize * (imgs.length / 2);
            var c = createCanvas(w, h);
            var ctx = c.getContext("2d");
            var i = 0;
            for (let y = 0; y < imgs.length / 2; y++) {
                for (let x = 0; x < imgs.length / 2; x++) {
                    if (imgs[i]) {
                        ctx.drawImage(
                            imgs[i],
                            x * imgSize,
                            y * imgSize,
                            imgSize,
                            imgSize
                        );
                        i++;
                    }
                }
            }
            resolve(c.toBuffer("image/png"));
        });
    });
}

module.exports = {
    laugh: laugh,
    homodog: homodog,
    flip: flip,
    sb: sb,
    frame: frame,
    weezer: weezer,
    carbs: carbs,
    watermark: watermark,
    animethink: animethink,
    animethink2: animethink2,
    dalle2watermark: dalle2watermark,
    frame2: frame2,
    unfunnyTest: unfunnyTest,
    spotted: spotted,
    getTextWidth: getTextWidth,
    dog: dog,
    robertDowneyJunior: robertDowneyJunior,
    createCollage: createCollage,
};