import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "downloadgif",
    name: "Download GIF",
    desc: "Downloads a Tenor GIF. Note that this also works on uploaded GIFs, for some reason.",
    aliases: ["dlgif"],
    needs: ["gif"],
    async execute(args, bufs) {
        return makeMessageResp(
            "flaps",
            "",
            bufs[0][0],
            getFileName("DownloadGIF", "gif")
        );
    },
} satisfies FlapsCommand;
