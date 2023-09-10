import { bufferToDataURL, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";
import { lookup } from "mime-types";

module.exports = {
    id: "cube",
    name: "Cube",
    desc: "Puts an image on a cube.",
    needs: ["image"],
    execute(args, buffers) {
        return new Promise((res, rej) => {
            getWeb3DAPIImage("cube", {
                imageURL: bufferToDataURL(buffers[0][0], "image/png"),
            }).then((img) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        img,
                        getFileName("Web3D_Cube", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
