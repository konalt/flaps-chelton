import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import jhold from "../../lib/canvas/jhold";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "jhold",
    name: "J Hold",
    desc: "Makes J hold an object.",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            jhold(imgbuf[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "j",
                        "",
                        msg.channel as TextChannel,
                        out,
                        getFileName("Canvas_JHold", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
