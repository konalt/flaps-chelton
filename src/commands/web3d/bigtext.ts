import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { getWeb3DAPIImage } from "../../lib/web3dapi";

module.exports = {
    id: "bigtext",
    name: "Big Text",
    desc: "Creates some big ol' 3D text.",
    async execute(args) {
        let debug = false;
        if (args.includes("--debug")) {
            args = args.filter((a) => a != "--debug");
            debug = true;
        }
        let tt = "";
        let bt = "";
        if (args.join(" ").includes(":")) {
            tt = args.join(" ").split(":")[0];
            bt = args.join(" ").split(":")[1];
        } else if (args.length > 2) {
            bt = args.join(" ");
        } else if (args.length == 2) {
            tt = args[0];
            bt = args[1];
        } else if (args[0]) {
            bt = args[0];
        } else {
            bt = "TEXT";
            tt = "PLEASE";
        }
        tt = tt.toUpperCase();
        bt = bt.toUpperCase();
        let img = await getWeb3DAPIImage("bigtext", {
            topText: tt,
            bottomText: bt,
            debug: debug,
        });
        return makeMessageResp(
            "flaps",
            "",
            img,
            getFileName("Web3D_BigText", "png")
        );
    },
} satisfies FlapsCommand;
