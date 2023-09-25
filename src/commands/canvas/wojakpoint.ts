import wojakpoint from "../../lib/canvas/wojakpoint";
import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "wojakpoint",
    name: "Wojak Point",
    desc: "Makes two Wojaks point at something interesting.",
    needs: ["image"],
    async execute(args, buffers) {
        return new Promise((res, rej) => {
            wojakpoint(buffers[0][0]).then((out: Buffer) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        out,
                        getFileName("Canvas_WojakPoint", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
