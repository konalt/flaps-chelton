import { downloadPromise } from "../lib/download";
import { getFileExt, getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "avatar",
    name: "Avatar",
    desc: "Returns a user's avatar.",
    showOnCommandSimulator: false,
    async execute(args, buf, msg) {
        return new Promise(async (res, rej) => {
            let user = msg.mentions.users.first();
            if (!user) {
                if (msg.reference) {
                    let ref = await msg.fetchReference();
                    user = ref.author;
                } else {
                    user = msg.author;
                }
            }
            let url = user.avatarURL();
            if (!url) {
                return res(
                    makeMessageResp("flaps", "that mf dont have an avatar")
                );
            }
            if (args.includes("--nogif") || getFileExt(url) == "webp") {
                url = url.split(".").slice(0, -1).join(".") + ".png";
            }
            const image = await downloadPromise(url);
            res(
                makeMessageResp(
                    "flaps",
                    "",
                    null,
                    image,
                    getFileName("Avatar", getFileExt(url))
                )
            );
        });
    },
} satisfies FlapsCommand;
