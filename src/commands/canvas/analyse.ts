import analyse from "../../lib/canvas/analyse";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "analyse",
    name: "Analyse",
    desc: "Analyses a single message. Useful for keyspams!",
    async execute(args, _, msg) {
        let text = args.join(" ");
        if (msg.reference) {
            let ref = await msg.fetchReference();
            text = ref.content;
        }
        let out = await analyse(text);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Analyse", "png")
        );
    },
} satisfies FlapsCommand;
