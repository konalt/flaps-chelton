import spotify from "../../lib/canvas/spotify";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "thisis",
    name: "This Is",
    desc: "Creates a Spotify 'This Is' image.",
    needs: ["image"],
    aliases: ["spotify"],
    async execute(args, imgbuf) {
        let out = await spotify(imgbuf[0][0], args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Spotify", "png")
        );
    },
} satisfies FlapsCommand;
