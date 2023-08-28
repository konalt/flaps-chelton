import twemoji from "twemoji";
import { downloadPromise } from "../lib/download";
import { getFileName, makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "emoji",
    name: "Emoji",
    showOnCommandSimulator: false,
    async execute(args, buf, msg) {
        return new Promise(async (res, rej) => {
            function s(url: string, gif: boolean, name: string) {
                downloadPromise(url).then((emoji) => {
                    res(
                        makeMessageResp(
                            "flaps",
                            "your emoji is: damn " + name,
                            msg.channel,
                            emoji,
                            getFileName("Emoji", gif ? "gif" : "png")
                        )
                    );
                });
            }
            var emj = args[0];
            if (!emj) {
                var ref = await msg.fetchReference();
                if (ref) {
                    emj = ref.content.split(" ")[0];
                }
            }
            if (emj) {
                if (emj.match(/(<a?)?:\w+:(\d+>)/g)) {
                    var e = emj;
                    var id = e.split(":")[2].split(">")[0];
                    var name = e.split(":")[1];
                    var anim = e.split(":")[0].split("<")[1] == "a";
                    var url =
                        "https://cdn.discordapp.com/emojis/" +
                        id +
                        "." +
                        (anim ? "gif" : "png");
                    s(url, anim, name);
                } else if (emj.match(/(?=\p{Emoji})(?=[\D])(?=[^\*])/gu)) {
                    var url = twemoji
                        .parse(emj, { size: 72 })
                        .split('src="')[1]
                        .split('"/>')[0];
                    s(url, false, emj);
                } else {
                    res(
                        makeMessageResp(
                            "flaps",
                            "that aint an emoji!",
                            msg.channel
                        )
                    );
                }
            } else {
                res(
                    makeMessageResp(
                        "flaps",
                        "sorry, ol' buddy, ol' pal! you need to gimme an emoji!!",
                        msg.channel
                    )
                );
            }
        });
    },
} satisfies FlapsCommand;
