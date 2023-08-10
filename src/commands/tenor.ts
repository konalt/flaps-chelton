import { downloadPromise } from "../lib/download";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import fetch from "node-fetch";

function tenorURLToGifURL(url: string): Promise<string> {
    var searchString = '<meta class="dynamic" name="twitter:image" content="';
    return new Promise((resl) => {
        /* @ts-ignore */
        fetch(url).then((value: Response) => {
            value.text().then((data) => {
                var newURL = data
                    .substring(data.indexOf(searchString) + searchString.length)
                    .split('"')[0];
                resl(newURL);
            });
        });
    });
}

module.exports = {
    id: "tenor",
    name: "Tenor",
    desc: "Downloads a GIF from Tenor from a URL. Different from !dlgif for reasons.",
    execute(args) {
        return new Promise(async (res, rej) => {
            if (args[0] && args[0].startsWith("https://tenor.com/view/")) {
                let gif = await downloadPromise(
                    await tenorURLToGifURL(args[0])
                );
                res(
                    makeMessageResp(
                        "flaps",
                        ``,
                        null,
                        gif,
                        getFileName("TenorGIF", "gif")
                    )
                );
            } else {
                res(makeMessageResp("flaps", `gimme a url ffs`));
            }
        });
    },
} satisfies FlapsCommand;
