import fakenews from "../../lib/canvas/fakenews";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "fakenews",
    name: "Fake News",
    desc: "Creates a fake news screenshot.",
    needs: ["image"],
    async execute(args, buf) {
        let out = await fakenews(
            buf[0][0],
            args.join(" ").split(":")[0] || "news",
            args.join(" ").split(":")[1] || "hi"
        );
        return makeMessageResp(
            "shapiro",
            "",
            out,
            getFileName("Canvas_FakeNews", "png")
        );
    },
} satisfies FlapsCommand;
