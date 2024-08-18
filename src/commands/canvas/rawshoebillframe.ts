import { FlapsCommand } from "../../types";
import {
    PLACEHOLDER_IMAGE,
    getFileName,
    makeMessageResp,
} from "../../lib/utils";
import createShoebillFrame from "../../lib/canvas/createShoebillFrame";
import { ffmpegBuffer, file } from "../../lib/ffmpeg/ffmpeg";

module.exports = {
    id: "rawshoebillframe",
    name: "Raw Shoebill",
    desc: "Generates only a shoebill frame.",
    execute(args, buf) {
        return new Promise((res, rej) => {
            createShoebillFrame(
                args
                    .slice(1)
                    .join(" ")
                    .split(",")
                    .map((m) => {
                        let n = m.split(" ");
                        return {
                            x: parseFloat(n[0]),
                            y: parseFloat(n[1]),
                            rotate: parseFloat(n[2]),
                            scaleFactor: parseFloat(n[3]),
                        };
                    }),
                PLACEHOLDER_IMAGE
            ).then(async (out) => {
                let ff = await ffmpegBuffer(
                    `-i ${file(
                        "shoebill.mp4"
                    )} -i $BUF0 -filter_complex "[0:v]select=eq(n\\,${
                        args[0]
                    })[sbf];[sbf][1:v]overlay=0:0[o]" -map "[o]" -frames:v 1 $OUT`,
                    [[out, "png"]]
                );
                res(
                    makeMessageResp(
                        "flaps",
                        "",
                        null,
                        ff,
                        getFileName("Canvas_RawShoebills", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
