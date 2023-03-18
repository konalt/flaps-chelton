import { FlapsCommand } from "../../types";
import { question } from "../../lib/ai/question";
import caption2 from "../../lib/ffmpeg/caption2";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { readFileSync } from "fs";
import { file } from "../../lib/ffmpeg/ffmpeg";

module.exports = {
    id: "tragicdeath",
    name: "Tragic Death",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            question(
                "finish the sentence comedically:\nme tragically dying after"
            ).then((answer: string) => {
                caption2(
                    [[readFileSync(file("images/sam.mp4")), "images/sam.mp4"]],
                    {
                        text: answer.startsWith("me tragically dying after")
                            ? answer
                            : "me tragically dying after " + answer,
                    }
                ).then((buf: Buffer) => {
                    res(
                        makeMessageResp(
                            "flaps",
                            "",
                            msg.channel,
                            buf,
                            getFileName("Effect_TragicDeath", "mp4")
                        )
                    );
                });
            });
        });
    },
} satisfies FlapsCommand;
