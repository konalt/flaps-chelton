import { Router } from "express";
import { commands } from "..";
import {
    CommandResponseType,
    FlapsMessageCommandResponse,
    StableDiffusionOptions,
} from "../types";
import { question } from "./ai/question";
import stablediffusion from "./ai/stablediffusion";
import { bufferToDataURL, dataURLToBuffer, uuidv4 } from "./utils";
import { extension, lookup } from "mime-types";
import { writeFileSync } from "fs";
import { hooks, sendWebhook } from "./webhooks";
import { Message } from "discord.js";
import { users } from "./users";

const funnynumber = require("../commands/funnynumber");

const router = Router({
    mergeParams: true,
});

router.post("/dalle2", (req, res) => {
    stablediffusion(
        {
            prompt: req.body.prompt,
        },
        req.body.single || false
    )
        .then((buf) => {
            res.contentType("image/png").send(buf);
        })
        .catch((err) => {
            res.status(500).contentType("text/plain").send(err);
        });
});

router.post("/inpaint", (req, res) => {
    let obj = { ...req.body };
    Object.assign(obj, { inpaint: true });
    stablediffusion(obj as StableDiffusionOptions, req.body.single || false)
        .then((buf) => {
            res.contentType("image/png").send(buf);
        })
        .catch((err) => {
            res.status(500).contentType("text/plain").send(err);
        });
});

router.post("/question", (req, res) => {
    question(req.body.question).then((answer) => {
        res.contentType("txt").send(answer);
    });
});

router.get("/legacy/question/:question", (req, res) => {
    question(req.params.question.replace(/_sps_/g, " ")).then((answer) => {
        res.contentType("txt").send(answer);
    });
});

router.get("/legacy/funnynumber/:funnynumber", (req, res) => {
    funnynumber
        .execute([req.params.funnynumber, "--noformat"], [])
        .then((resp: FlapsMessageCommandResponse) => {
            res.contentType("txt").send(resp.content);
        });
});

function xbuf(url: string, ext = null) {
    var buf = dataURLToBuffer(url);
    var inFile =
        "images/cache/" +
        uuidv4() +
        "." +
        extension(url.split(":")[1].split(";")[0]);
    writeFileSync(inFile, buf);
    return [buf, inFile];
}

router.post("/runcmd", (req, res) => {
    let command = commands.find((cmd) =>
        cmd.aliases.includes(req.body.id.toLowerCase())
    );
    if (command) {
        var files = (req.body.files || []).map((x: string) => xbuf(x));
        console.log(files);
        command
            .execute((req.body.args || "").split(" "), files, {
                channel: null,
            } as Message)
            .then((response) => {
                switch (response.type) {
                    case CommandResponseType.Message:
                        res.json({
                            id: response.id,
                            type: 0,
                            channel: null,
                            filename: response.filename,
                            content: response.content,
                            buffer: response.buffer
                                ? bufferToDataURL(
                                      response.buffer,
                                      lookup(response.filename) || "text/plain"
                                  )
                                : null,
                        });
                        break;
                }
            });
    }
});

router.get("/commands", (req, res) => {
    res.json(commands);
});

router.get("/legacy/userdata/:id", (req, res) => {
    let user = hooks.get(req.params.id);
    if (user) {
        res.contentType("txt").send(user.name);
    } else {
        res.contentType("txt").send("FlapsAPIUnknownUser");
    }
});

export default router;
