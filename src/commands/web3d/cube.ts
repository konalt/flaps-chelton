import { bufferToDataURL, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";

module.exports = {
    id: "cube",
    name: "Cube",
    desc: "Puts an image on a cube.",
    needs: ["image"],
    async execute(args, buffers) {
        let img = await getWeb3DAPIImage("cube", {
            imageURL: bufferToDataURL(buffers[0][0], "image/png"),
        });
        return makeMessageResp(
            "flaps",
            "",
            img,
            getFileName("Web3D_Cube", "png")
        );
    },
} satisfies FlapsCommand;
