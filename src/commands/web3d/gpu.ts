import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { gpu } from "../../lib/web3dapi";

module.exports = {
    id: "gpu",
    name: "GPU",
    desc: "Checks Web3D GPU support.",
    async execute() {
        let img = await gpu();
        return makeMessageResp(
            "flaps",
            "",
            img,
            getFileName("Web3D_GPU", "png")
        );
    },
} satisfies FlapsCommand;
