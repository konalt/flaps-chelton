import raptv from "../../lib/canvas/raptv";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "raptv",
    name: "Rap TV",
    desc: "Creates a Rap TV news image.",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            raptv(buf[0][0], args.join(" ")).then((out) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        out,
                        getFileName("Canvas_RapTV", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
