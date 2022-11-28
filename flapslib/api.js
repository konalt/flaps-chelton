const { Router } = require("express");
const { watermark, andrewTate, fakeNews } = require("./canvas");
const { dataURLToBuffer, uuidv4 } = require("./util");
const { readFileSync, fstat, writeFileSync } = require("fs");
const { extension } = require("mime-types");
const { caption2, getVideoDimensions } = require("./video");
const { resolve } = require("path");

/**
 * @type {Router}
 */
const router = new Router({
    mergeParams: true,
});

//#region Canvas Endpoints
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

canvasRouter.post("/caption2", (req, res) => {
    var file = req.body.file;
    var text = req.body.text;
    var filetypes = "image/png,image/jpeg,image/gif,video/mp4".split(",");
    if (!file || !filetypes.includes(file.split(":")[1].split(";")[0]) || !text)
        return res.status(400).send({
            error: "Parameter 'file' must be a data URI for image/png, image/jpeg, image/gif, video/mp4.\nParameter 'text' must be text.",
        });
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
        extension(file.split(":")[1].split(";")[0]);
    writeFileSync(inFile, buf);
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
                console.log(err);
                res.status(500).send(err);
            });
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
