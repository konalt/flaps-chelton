import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import warrior from "../../lib/canvas/warrior";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "warrior",
    name: "warrior.png 47TB",
    desc: "war",
    needs: ["image"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            warrior(imgbuf[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        msg.channel as TextChannel,
                        out,
                        getFileName("Canvas_Warrior", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
