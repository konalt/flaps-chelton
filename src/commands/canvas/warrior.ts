import warrior from "../../lib/canvas/warrior";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "warrior",
    name: "warrior.png 47TB",
    desc: "war",
    needs: ["image"],
    async execute(args, imgbuf) {
        let out = await warrior(imgbuf[0][0]);
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Canvas_Warrior", "png")
        );
    },
} satisfies FlapsCommand;
