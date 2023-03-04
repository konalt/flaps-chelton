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
import { sendWebhook } from "./webhooks";
import { Message } from "discord.js";

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

function xbuf(url: string, ext = null) {
    return new Promise((res, rej) => {
        var buf = dataURLToBuffer(url);
        var inFile =
            "images/cache/" +
            uuidv4() +
            "." +
            extension(url.split(":")[1].split(";")[0]);
        writeFileSync(inFile, buf);
        res(inFile);
    });
}

router.post("/runcmd", (req, res) => {
    let command = commands.find((cmd) =>
        cmd.aliases.includes(req.body.id.toLowerCase())
    );
    if (command) {
        command
            .execute(
                (req.body.args || "").split(" "),
                (req.body.files || []).map((x: string) => xbuf(x)),
                { channel: null } as Message
            )
            .then((response) => {
                switch (response.type) {
                    case CommandResponseType.Message:
                        res.json({
                            id: response.id,
                            type: 0,
                            channel: null,
                            filename: response.filename,
                            content: response.content,
                            buffer: bufferToDataURL(
                                response.buffer,
                                lookup(response.filename)
                            ),
                        });
                        break;
                }
            });
    }
});

export default router;
