import { StickerFormatType } from "discord.js";
import { downloadPromise } from "../lib/download";
import { getFileExt, getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "sticker",
    name: "Sticker",
    desc: "Returns the sticker from the replied message.",
    showOnCommandSimulator: false,
    async execute(_, _2, msg) {
        if (!msg.reference)
            return makeMessageResp(
                "flaps",
                "reply to a message to get a sticker!"
            );
        let ref = await msg.fetchReference();
        let sticker = ref.stickers.first();
        if (!sticker)
            return makeMessageResp(
                "flaps",
                "that message doesn't have a sticker!"
            );
        if (sticker.format == StickerFormatType.Lottie)
            return makeMessageResp(
                "flaps",
                "lottie stickers are not supported!\n(generally, this means the default discord stickers don't work...)"
            );
        let buffer = await downloadPromise(sticker.url);
        return makeMessageResp(
            "flaps",
            "",
            buffer,
            getFileName("Sticker", getFileExt(sticker.url))
        );
    },
} satisfies FlapsCommand;
