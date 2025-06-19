import createQuote from "../../lib/canvas/createQuote";
import { downloadPromise } from "../../lib/download";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "quote",
    name: "Quote",
    desc: "Turns a message into a memorable quote image",
    needs: ["image?"],
    showOnCommandSimulator: false,
    async execute(args, _, msg) {
        let ref = await msg.fetchReference();
        let avatar = await downloadPromise(
            (ref.member.avatarURL() ?? ref.author.avatarURL())
                .split(".")
                .slice(0, -1)
                .join(".") + ".png"
        );
        let content = ref.content;
        let username = ref.author.username;
        let displayName =
            (ref.member ?? { nickname: null }).nickname ??
            ref.author.displayName;
        let image = await createQuote(
            content,
            displayName,
            `@${username}`,
            avatar
        );
        return makeMessageResp(
            "flaps",
            "",
            image,
            getFileName("Canvas_Quote", "png")
        );
    },
} satisfies FlapsCommand;
