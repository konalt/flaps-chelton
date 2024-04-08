import { bufferToDataURL, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";

module.exports = {
    id: "fumo",
    name: "Fumo",
    desc: "fumofumo ᗜˬᗜ",
    needs: ["image"],
    execute(args, buffers) {
        return new Promise((res, rej) => {
            getWeb3DAPIImage("cirno", {
                img: bufferToDataURL(buffers[0][0], "image/png"),
            }).then((img) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        img,
                        getFileName("Web3D_Cirno", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
