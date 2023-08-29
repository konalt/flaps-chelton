import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import loregift from "../../lib/canvas/loregift";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "loregift",
    name: "Lore Gift",
    desc: "Makes Loremaster gift you an object.",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            loregift(imgbuf[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        msg.channel as TextChannel,
                        out,
                        getFileName("Canvas_LoreGift", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
