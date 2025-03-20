import { bufferToDataURL, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";

module.exports = {
    id: "duvall",
    name: "shelley durvall",
    desc: "SHEIKLLSEI YOUR DERVALLLLL",
    needs: ["image"],
    async execute(args, buffers) {
        let img = await getWeb3DAPIImage("duvall", {
            img: bufferToDataURL(buffers[0][0], "image/png"),
        });
        return makeMessageResp(
            "flaps",
            "",
            img,
            getFileName("Web3D_Duvall", "png")
        );
    },
} satisfies FlapsCommand;
