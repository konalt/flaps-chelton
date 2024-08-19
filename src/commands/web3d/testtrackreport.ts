import { getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { trackReport } from "../../lib/web3dapi";
import { readFile } from "fs/promises";

module.exports = {
    id: "testtrackreport",
    name: "Test Track Report",
    desc: "Tests the track report feature in the current channel",
    needs: [],
    showOnCommandSimulator: false,
    execute(args, _1, msg) {
        return new Promise(async (res, rej) => {
            let d = new Date();
            if (args[0] == "yesterday") {
                d.setHours(d.getHours() - 24);
            }
            let dateStr = `${d.getFullYear().toString().padStart(4, "0")}-${(
                d.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
            console.log(d);

            trackReport(
                await readFile(`./track/${msg.guildId}/${dateStr}.txt`, "utf-8")
            ).then((img) => {
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        img,
                        getFileName("Web3D_TestTrackReport", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
