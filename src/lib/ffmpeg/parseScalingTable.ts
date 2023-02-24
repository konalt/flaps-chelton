import { log, esc, Color } from "../logger";
import { ffmpeg, ffmpegBuffer, file } from "./ffmpeg";
import { copyFileSync, existsSync } from "fs";

let scalingTableHelpers = ["STR END XPS YPS WTH HGT"];

export default function parseScalingTable(
    txt: string,
    in_specifier: string,
    frame_count: number,
    v_width: number,
    v_height: number,
    input: [Buffer, string]
) {
    return new Promise<void>((resolve) => {
        var start = Date.now();
        var scale = 1;
        var ext = input[1].split(".").pop();
        var list = txt // convert buffer to string
            .split("\n") // remove newlines
            .map((x) => x.trim().replace(/ +/g, " ")) // strip CR if windows, remove duplicate spaces
            .filter((x) => !scalingTableHelpers.includes(x.toUpperCase())) // remove helper lines
            .map((x) => x.split(" ").map((y) => parseInt(y))) // make array of numbers
            .map((x) => ({
                start: x[0],
                end: x[1],
                x: x[2] * scale,
                y: x[3] * scale,
                width: x[4] * scale,
                height: x[5] * scale,
            })); // make objects
        var promises = [];
        var cDir = list[0];
        var cDirInd = 0;
        var lastIndGen = -1;
        log(`${esc(Color.White)}Creating image sequence...`, "scalingtable");
        for (let frame_num = 0; frame_num < frame_count; frame_num++) {
            if (frame_num > cDir.end) {
                cDir = list[cDirInd++];
            }
            if (lastIndGen != cDirInd) {
                promises.push(
                    (() => {
                        return new Promise<void>((res) => {
                            ffmpeg(
                                `-i ${file(
                                    input[1]
                                )} -filter_complex "[0:v]scale=${cDir.width}:${
                                    cDir.height
                                },pad=${v_width}:${v_height}:${cDir.x}:${
                                    cDir.y
                                },setsar=1:1[out]" -map "[out]" ${file(
                                    input[1] +
                                        "." +
                                        frame_num.toString().padStart(3, "0") +
                                        "." +
                                        ext
                                )}`
                            )
                                .then(() => {
                                    res();
                                })
                                .catch(() => {
                                    res();
                                });
                        });
                    })()
                );
                lastIndGen = cDirInd;
            }
        }
        Promise.all(promises).then(() => {
            log(
                `${esc(Color.White)}Keyframes created. Copying...`,
                "scalingtable"
            );
            var curFile = file(
                input[1] + "." + "0".padStart(3, "0") + "." + ext
            );
            for (let frame_num = 0; frame_num < frame_count; frame_num++) {
                var newFile = file(
                    input[1] +
                        "." +
                        frame_num.toString().padStart(3, "0") +
                        "." +
                        ext
                );
                if (!existsSync(newFile)) {
                    copyFileSync(curFile, newFile);
                } else {
                    curFile = newFile;
                }
            }
            log(`${esc(Color.White)}All frames created.`, "scalingtable");
            resolve();
        });
    });
}
