import twemoji from "twemoji";
import { downloadPromise } from "../lib/download";
import { getFileName, makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "emoji",
    name: "Emoji",
    aliases: ["emojify"],
    showOnCommandSimulator: false,
    async execute(args, buf, msg) {
        var emj = args[0];
        if (!emj) {
            var ref = await msg.fetchReference();
            if (ref) {
                emj = ref.content.split(" ")[0];
            }
        }
        if (emj) {
            if (emj.match(/(<a?)?:\w+:(\d+>)/g)) {
                let id = emj.split(":")[2].split(">")[0];
                var anim = emj.split(":")[0].split("<")[1] == "a";
                var url = `https://cdn.discordapp.com/emojis/${id}.${
                    anim ? "gif" : "png"
                }`;
                let emoji = await downloadPromise(url);
                return makeMessageResp(
                    "flaps",
                    "",
                    emoji,
                    getFileName("Emoji", anim ? "gif" : "png")
                );
            } else if (emj.match(/(?=\p{Emoji})(?=[\D])(?=[^\*])/gu)) {
                var url = twemoji
                    .parse(emj, { size: 72 })
                    .split('src="')[1]
                    .split('"/>')[0];
                let emoji = await downloadPromise(url);
                return makeMessageResp(
                    "flaps",
                    "",
                    emoji,
                    getFileName("Emoji", "png")
                );
            } else {
                return makeMessageResp("flaps", "that aint an emoji!");
            }
        } else {
            return makeMessageResp(
                "flaps",
                "sorry, ol' buddy, ol' pal! you need to gimme an emoji!!"
            );
        }
    },
} satisfies FlapsCommand;
