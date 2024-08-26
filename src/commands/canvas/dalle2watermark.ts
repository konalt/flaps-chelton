import dalle2watermark from "../../lib/canvas/dalle2watermark";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "dalle2watermark",
    name: "DALL-E 2 Watermark",
    desc: "Applies the DALL-E 2 watermark to an image.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await dalle2watermark(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_DallE2Watermark", "png")
        );
    },
} satisfies FlapsCommand;
