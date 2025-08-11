import hexcode from "../../lib/canvas/hexcode";
import { makeMessageResp, rgbToHex } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "hexcode",
    name: "Hex Code",
    desc: "Gets the average hex colour of an image.",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await hexcode(imgbuf[0][0]);
        return makeMessageResp("flaps", `${rgbToHex(out)}`);
    },
} satisfies FlapsCommand;
