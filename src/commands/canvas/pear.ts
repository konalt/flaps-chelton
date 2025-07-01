import { createCanvas, loadImage } from "canvas";
import { detectFace } from "../../lib/face";
import { FlapsCommand } from "../../types";
import { getFileName, makeMessageResp } from "../../lib/utils";
import pear from "../../lib/canvas/pear";

module.exports = {
    id: "pear",
    name: "Pear",
    desc: "Puts a face on a pear. Make sure the image has a face!",
    needs: ["image"],
    async execute(args, imgbuf) {
        let img = await loadImage(imgbuf[0][0]);
        let face = await detectFace(imgbuf[0][0]);
        if (!face) {
            return makeMessageResp(
                "teto",
                "i couldnt find a face in that image :("
            );
        }
        const ofCanvas = createCanvas(face.box.width, face.box.height);
        const ofCtx = ofCanvas.getContext("2d");
        ofCtx.drawImage(img, -face.box.x, -face.box.y);
        const onlyFace = ofCanvas.toBuffer();
        return makeMessageResp(
            "teto",
            "",
            await pear(onlyFace),
            getFileName("Canvas_Pear", "png")
        );
    },
} satisfies FlapsCommand;
