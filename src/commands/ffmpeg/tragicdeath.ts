import { FlapsCommand } from "../../types";
import { question } from "../../lib/ai/question";
import caption2 from "../../lib/ffmpeg/caption2";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { readFileSync } from "fs";
import { file } from "../../lib/ffmpeg/ffmpeg";

module.exports = {
    id: "tragicdeath",
    name: "Tragic Death",
    desc: "Makes poor sam die tragically.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            question(
                "finish the sentence comedically, without adding any funny comments afterwards:\nme tragically dying after"
            ).then((answer: string) => {
                caption2(
                    [[readFileSync(file("images/sam.mp4")), "images/sam.mp4"]],
                    {
                        text: (answer
                            .toLowerCase()
                            .startsWith("me tragically dying after")
                            ? answer
                            : "me tragically dying after " + answer
                        ).replace(/\./g, ""),
                    }
                ).then((buf: Buffer) => {
                    res(
                        makeMessageResp(
                            "flaps",
                            "",
                            buf,
                            getFileName("Effect_TragicDeath", "mp4")
                        )
                    );
                });
            });
        });
    },
} satisfies FlapsCommand;
