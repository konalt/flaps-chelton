import { downloadPromise } from "../lib/download";
import { getFileName, makeMessageResp, tenorURLToGifURL } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "tenor",
    name: "Tenor",
    desc: "Downloads a GIF from Tenor from a URL. Different from !dlgif for reasons.",
    async execute(args) {
        if (args[0] && args[0].startsWith("https://tenor.com/view/")) {
            let gif = await downloadPromise(await tenorURLToGifURL(args[0]));
            return makeMessageResp(
                "flaps",
                ``,
                gif,
                getFileName("TenorGIF", "gif")
            );
        } else {
            return makeMessageResp("flaps", `gimme a url ffs`);
        }
    },
} satisfies FlapsCommand;
