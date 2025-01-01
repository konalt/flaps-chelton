import { bufferToDataURL, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";

module.exports = {
    id: "bed",
    name: "Bed",
    desc: "Puts an image on a custom duvet cover.",
    needs: ["image"],
    async execute(args, buffers) {
        let img = await getWeb3DAPIImage("bed", {
            img: bufferToDataURL(buffers[0][0], "image/png"),
        });
        return makeMessageResp(
            "flaps",
            "",
            img,
            getFileName("Web3D_Bed", "png")
        );
    },
} satisfies FlapsCommand;
