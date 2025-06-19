import dat from "../../lib/canvas/dat";
import fakeNews from "../../lib/canvas/fakenews";
import homodog from "../../lib/canvas/homodog";
import caption from "../../lib/ffmpeg/caption";
import caption2 from "../../lib/ffmpeg/caption2";
import cigs from "../../lib/ffmpeg/cigs";
import { getVideoDimensions } from "../../lib/ffmpeg/getVideoDimensions";
import snapchat from "../../lib/ffmpeg/snapchat";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "captionhell",
    name: "Caption Hell",
    desc: "Sends an image through caption hell",
    needs: ["image"],
    async execute(args, imgbuf) {
        let dims = await getVideoDimensions(imgbuf[0]);
        let avgDims = (dims[0] + dims[1]) / 2;
        let text = args.join(" ");

        let snapchatted = await snapchat(imgbuf, { text });
        let cigged = await cigs([[snapchatted, "png"]], { text });
        let captioned = await caption([[cigged, "png"]], {
            text: `${text}:${text}`,
            fontsize: avgDims * 0.015,
        });
        let homodogged = await homodog(captioned, text);
        let caption2ed = await caption2([[homodogged, "png"]], { text });
        let datted = await dat(caption2ed, text);
        let fakenewsed = await fakeNews(datted, text, `${text} `.repeat(10));

        return makeMessageResp(
            "flaps",
            "",
            fakenewsed,
            getFileName("CaptionHell", "png")
        );
    },
} satisfies FlapsCommand;
