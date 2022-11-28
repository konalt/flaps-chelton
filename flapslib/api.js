const { Router } = require("express");
const { watermark, andrewTate } = require("./canvas");
const { dataURLToBuffer } = require("./util");
const { readFileSync } = require("fs");

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
