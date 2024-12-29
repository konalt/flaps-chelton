import { bufferToDataURL, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";

module.exports = {
    id: "fumo",
    name: "Fumo",
    desc: "fumofumo ᗜˬᗜ",
    needs: ["image"],
    async execute(args, buffers) {
        let img = await getWeb3DAPIImage("cirno", {
            img: bufferToDataURL(buffers[0][0], "image/png"),
        });
        return makeMessageResp(
            "flaps",
            "",
            img,
            getFileName("Web3D_Fumo", "png")
        );
    },
} satisfies FlapsCommand;
