import removeBackground from "../lib/removebg";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "removebg",
    name: "Remove BG",
    desc: "Removes a background.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await removeBackground(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("RemoveBG", "png")
        );
    },
} satisfies FlapsCommand;
