import { spawn } from "child_process";
import { readFile, writeFileSync } from "fs";
import { extension } from "mime-types";
import { Color, esc, log } from "../logger";
import { uuidv4 } from "../utils";
import { join } from "path";

const extraArgs = "";
const ffmpegVerbose = false;

function file(pathstr: string) {
    return join(".", pathstr.includes("images") ? "" : "images", pathstr);
}
export function ffmpegBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt: string
): Promise<Buffer> {
    return new Promise((res, rej) => {
        var opId = uuidv4();
        var files = buffers.map((buf, n) => {
            return file(
                "/cache/BUF_" +
                    opId +
                    "_" +
                    n +
                    "." +
                    buf[1].split(".")[buf[1].split(".").length - 1]
            );
        });
        var outFile = file("/cache/BUF_" + opId + "_FINAL." + outExt);
        files.forEach((filename, i) => {
            writeFileSync(filename, buffers[i][0]);
        });
        args = args.replace(/\$BUF([0-9])+/g, (a, b) => {
            return files[parseInt(b)];
        });
        args = args.replace(/\$OUT/g, outFile);
        ffmpeg(args).then(() => {
            readFile(outFile, (e, data) => {
                if (e) return rej(e);
                res(data);
            });
        });
    });
}
export function ffmpeg(args: string, quiet = false) {
    return new Promise((resolve, reject) => {
        var startTime = Date.now();
        var newargs =
            extraArgs + " " + (ffmpegVerbose ? "" : "-v warning ") + args;
        console.log(newargs);
        var ffmpegInstance = spawn("ffmpeg", newargs.trim().split(" "), {
            shell: true,
        });
        var b = "";
        if (!quiet)
            log(
                `${esc(Color.White)}Instance PID: ${ffmpegInstance.pid}`,
                "ffmpeg"
            );
        ffmpegInstance.stdout.on("data", (c) => {
            b += c;
        });
        ffmpegInstance.stderr.on("data", (c) => {
            b += c;
        });
        ffmpegInstance.on("exit", (code) => {
            if (ffmpegVerbose) console.log(b);
            if (code == 0 && !quiet) {
                log(
                    `${esc(Color.Green)}Completed ${esc(Color.White)}in ${esc(
                        Color.BrightCyan
                    )}${Date.now() - startTime}ms`,
                    "ffmpeg"
                );
                resolve(args.split(" ").pop());
            } else {
                if (!quiet)
                    log(
                        `${esc(Color.Red)}Failed ${esc(Color.White)}in ${esc(
                            Color.BrightCyan
                        )}${Date.now() - startTime}ms`,
                        "ffmpeg"
                    );
                reject(b);
            }
        });
    });
}
