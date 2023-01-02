const { Router } = require("express");
const { watermark, andrewTate, fakeNews, spotifyThisIs } = require("./canvas");
const { dataURLToBuffer, uuidv4 } = require("./util");
const { readFileSync, fstat, writeFileSync } = require("fs");
const { extension } = require("mime-types");
const {
    caption2,
    getVideoDimensions,
    simpleMemeCaption,
    speed,
    compress,
} = require("./video");
const { resolve } = require("path");
const { resourceLimits } = require("worker_threads");
const { log, esc, Color } = require("./log");
const { video } = require(".");

/**
 * @type {Router}
 */
const router = new Router({
    mergeParams: true,
});

/**
 * @type {Router}
 */
const canvasRouter = new Router({
    mergeParams: true,
});

canvasRouter.post("/watermark", (req, res) => {
    var file = req.body.file;
    if (
        !file ||
        (!file.startsWith("data:image/png;base64") &&
            !file.startsWith("data:image/jpeg;base64"))
    )
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/png or image/jpeg.",
        });
    var buf = dataURLToBuffer(file);
    watermark(buf)
        .then((out) => {
            res.contentType("png").send(out);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

canvasRouter.post("/tate", (req, res) => {
    var file = req.body.file;
    var text = req.body.text;
    if (
        !file ||
        (!file.startsWith("data:image/png;base64") &&
            !file.startsWith("data:image/jpeg;base64")) ||
        !text
    )
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/png or image/jpeg.\nParameter 'text' must be text.",
        });
    var buf = dataURLToBuffer(file);
    andrewTate(buf, text)
        .then((out) => {
            res.contentType("png").send(out);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

canvasRouter.post("/news", (req, res) => {
    var file = req.body.file;
    var headline = req.body.headline;
    var ticker = req.body.ticker;
    if (
        !file ||
        (!file.startsWith("data:image/png;base64") &&
            !file.startsWith("data:image/jpeg;base64")) ||
        !headline ||
        !ticker
    )
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/png or image/jpeg.\nParameter 'headline' must be text.\nParameter 'ticker' must be text.",
        });
    var buf = dataURLToBuffer(file);
    fakeNews(buf, headline, ticker)
        .then((out) => {
            res.contentType("png").send(out);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

canvasRouter.post("/thisis", (req, res) => {
    var file = req.body.file;
    var text = req.body.text;
    if (
        !file ||
        (!file.startsWith("data:image/png;base64") &&
            !file.startsWith("data:image/jpeg;base64")) ||
        !text
    )
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/png or image/jpeg.\nParameter 'text' must be text.",
        });
    var buf = dataURLToBuffer(file);
    spotifyThisIs(buf, text)
        .then((out) => {
            res.contentType("png").send(out);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

function xbuf(file, ext = null) {
    return new Promise((res, rej) => {
        var buf = dataURLToBuffer(file);
        var inFile =
            "images/cache/" +
            uuidv4() +
            "." +
            extension(file.split(":")[1].split(";")[0]);
        var outFile =
            "images/cache/" +
            uuidv4() +
            "." +
            (ext || extension(file.split(":")[1].split(";")[0]));
        writeFileSync(inFile, buf);
        res([inFile, outFile]);
    });
}

canvasRouter.post("/caption2", (req, res) => {
    var file = req.body.file;
    var text = req.body.text;
    var filetypes = "image/png,image/jpeg,image/gif,video/mp4".split(",");
    if (!file || !filetypes.includes(file.split(":")[1].split(";")[0]) || !text)
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/png, image/jpeg, image/gif, video/mp4.\nParameter 'text' must be text.",
        });
    xbuf(file).then(([inFile, outFile]) => {
        getVideoDimensions(inFile).then((dim) => {
            caption2(inFile, outFile, {
                text: text,
                w: dim[0],
                h: dim[1],
            })
                .then(() => {
                    res.contentType(file.split(":")[1].split(";")[0]).sendFile(
                        resolve(__dirname + "/../" + outFile)
                    );
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        });
    });
});

canvasRouter.post("/speed", (req, res) => {
    var file = req.body.file;
    var speedX = req.body.speed;
    var filetypes = "image/gif,video/mp4,audio/mpeg".split(",");
    if (
        !file ||
        !filetypes.includes(file.split(":")[1].split(";")[0]) ||
        !speedX
    )
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/gif, video/mp4, audio/mpeg.\nParameter 'speed' must be a number.",
        });
    xbuf(file).then(([inFile, outFile]) => {
        speed(inFile, outFile, speedX)
            .then(() => {
                res.contentType(file.split(":")[1].split(";")[0]).sendFile(
                    resolve(__dirname + "/../" + outFile)
                );
            })
            .catch((err) => {
                res.status(500).send(err);
            });
    });
});

var ffmpegEffects = {
    holymoly: {
        filetypes: "image/png,image/jpeg",
        effect: video.holyMolyGreenscreen,
        ext: "mp4",
    },
    spin: {
        filetypes: "image/png,image/jpeg",
        effect: video.spin,
        ext: "gif",
        options: {
            gif: true,
            length: 2,
            speed: 1,
        },
    },
    christmas: {
        filetypes: "image/png,image/jpeg",
        effect: video.christmasWeek,
        ext: "mp4",
    },
    compress: {
        filetypes: "video/mp4,image/gif,image/png,image/jpeg",
        effect: video.compress,
    },
    cookingvideo: {
        filetypes: "image/png,image/jpeg",
        effect: video.cookingVideo,
        ext: "mp4",
    },
    thehorror: {
        filetypes: "image/png,image/jpeg",
        effect: video.theHorror,
        ext: "mp4",
    },
    stewie: {
        filetypes: "image/png,image/jpeg",
        effect: video.stewie,
        ext: "mp4",
    },
    reverse: {
        filetypes: "video/mp4,audio/mpeg",
        effect: video.reverse,
    },
    invert: {
        filetypes: "video/mp4,image/gif,image/png,image/jpeg",
        effect: video.invert,
    },
    blackwhite: {
        filetypes: "video/mp4,image/gif,image/png,image/jpeg",
        effect: video.blackWhite,
    },
    tinygif: {
        filetypes: "image/gif",
        effect: video.compressGIF,
    },
};

function doEffect(eff, file, res, options) {
    xbuf(file, options._ext).then(([inFile, outFile]) => {
        console.log(inFile, outFile);
        eff(inFile, outFile, options)
            .then(() => {
                res.contentType(
                    options._ext || file.split(":")[1].split(";")[0]
                ).sendFile(resolve(__dirname + "/../" + outFile));
            })
            .catch((err) => {
                res.status(500).send(err);
            });
    });
}

Object.entries(ffmpegEffects).forEach((effect) => {
    canvasRouter.post("/" + effect[0], (req, res) => {
        var file = req.body.file;
        var filetypes = effect[1].filetypes.split(",");
        if (!file || !filetypes.includes(file.split(":")[1].split(";")[0]))
            return res.status(400).send({
                error:
                    "Parameter 'file' must be a data URI for " +
                    effect[1].filetypes.join(", "),
            });
        doEffect(
            effect[1].effect,
            file,
            res,
            Object.assign(effect[1].options || {}, { _ext: effect[1].ext })
        );
    });
});

canvasRouter.get("/test", (_req, res) => {
    res.send("yeah");
});

router.use("/canvas", canvasRouter);
//#endregion

router.get("/suite_data", (_req, res) => {
    res.send(JSON.parse(readFileSync("./suite.json").toString()));
});

router.get("*", (_req, res) => {
    res.contentType("txt");
    res.status(404).send("Error: Unknown Endpoint!");
});

module.exports = router;
