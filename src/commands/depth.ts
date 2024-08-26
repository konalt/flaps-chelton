import getDepthMap from "../lib/depth";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "depth",
    name: "Depth",
    desc: "Turns an image into a depth map.",
    needs: ["image"],
    async execute(_, buffers) {
        let map = await getDepthMap(buffers[0][0]);
        return makeMessageResp("flaps", "", map, getFileName("Depth", "png"));
    },
} satisfies FlapsCommand;
