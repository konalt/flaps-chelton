import { spawn } from "child_process";
import { readFile, writeFileSync } from "fs";
import { extension } from "mime-types";
import { Color, esc, log } from "../logger";
import { getFileExt, scheduleDelete, uuidv4 } from "../utils";
import { join } from "path";
import { stdout } from "process";
import { addBuffer, removeBuffer } from "../..";

const extraArgs = "";

export const preset = "veryfast";

export function file(pathstr: string) {
    return join(".", pathstr.includes("images") ? "" : "images", pathstr);
}

function getOutputFormat(ext: string) {
    if (ext == "png") {
        return "-f image2 -c png";
    }
    if (ext == "jpeg" || ext == "jpg") {
        return "-f image2 -c mjpeg";
    }
    if (ext == "mp4") {
        return "-pix_fmt yuv420p -f mp4 -movflags faststart+frag_keyframe+empty_moov";
    }
    return "-f " + ext;
}

export function ffmpegBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt?: string
): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const ffmpegVerbose = process.env.FFMPEG_VERBOSE == "yes";
        if (!outExt) outExt = getFileExt(buffers[0][1]);
        outExt = outExt.toLowerCase();
        let verbosityArg = ffmpegVerbose ? "-v info" : "-v warning";
        let newargs = (
            verbosityArg +
            " " +
            args
                .replace(/\r?\n/g, "")
                .replace(/\$PRESET/g, `${usePreset(outExt)}`)
                .replace(/\$OUT/g, `${getOutputFormat(outExt)} -`)
        ).trim();

        let bufferNames = [];
        for (const [buffer, filename] of buffers) {
            bufferNames.push(
                addBuffer(buffer, getFileExt(filename.toLowerCase()))
            );
        }

        newargs = newargs.replace(/\$BUF([0-9])+/g, (a, b) => {
            return "http://localhost:56033/" + bufferNames[parseInt(b)];
        });

        if (ffmpegVerbose)
            log(`Launch Args: ${esc(Color.White)}` + newargs, "ffmpeg");

        const childProcess = spawn("ffmpeg", newargs.split(" "), {
            shell: true,
        });
        let chunkedOutput = [];
        let errorLog = "ARGS: ffmpeg " + newargs + "\n";
        childProcess.stdout.on("data", (chunk: Buffer) => {
            chunkedOutput.push(chunk);
        });
        childProcess.stderr.on("data", (chunk: string) => {
            errorLog += chunk;
            if (ffmpegVerbose) {
                process.stdout.write(chunk);
            }
        });
        childProcess.on("exit", (code) => {
            let file = Buffer.concat(chunkedOutput);
            for (const bufferName of bufferNames) {
                removeBuffer(bufferName);
            }
            if (code == 0) {
                resolve(file);
            } else {
                reject(errorLog);
            }
        });
    });
}

/**
 * @deprecated Creates too many intermediate files
 */
function ffmpegOldBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt?: string,
    noFileReturn?: false
): Promise<Buffer>;
function ffmpegOldBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt?: string,
    noFileReturn?: true
): Promise<string>;
function ffmpegOldBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt?: string,
    noFileReturn?: any
): Promise<Buffer>;
function ffmpegOldBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt?: string,
    noFileReturn?: boolean
): Promise<Buffer | string> {
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
        if (!outExt) outExt = getFileExt(buffers[0][1]);
        var outFile = `-f ${outExt} -`;
        files.forEach((filename, i) => {
            writeFileSync(filename, buffers[i][0]);
        });
        args = args.replace(/\$BUF([0-9])+/g, (a, b) => {
            return files[parseInt(b)];
        });
        args = args.replace(/\$OUT/g, outFile);
        ffmpeg(args).then(() => {
            if (!noFileReturn) {
                readFile(outFile, (e, data) => {
                    if (e) return rej(e);
                    res(data);
                });
            } else {
                res(outFile);
            }
            scheduleDelete(file("/cache/BUF_" + opId + "_FINAL." + outExt), 30);
            for (const path of files) {
                scheduleDelete(path, 30);
            }
        }, rej);
    });
}
const ffmpegLogRegex =
    /(ffmpeg version [^ ]+ Copyright \(c\) \d+-\d+ the FFmpeg developers)|(  built with .+)|(  configuration: (--[a-z0-9\-]+ ?)+)|(  lib[a-z0-9]+ +\d+\. +\d+\.\d+ +\/ +\d+\. +\d+\.\d+$)/gm;
export { ffmpegOldBuffer };
export function ffmpeg(args: string, quiet = false) {
    return new Promise((resolve, reject) => {
        const ffmpegVerbose = process.env.FFMPEG_VERBOSE == "yes";

        var startTime = Date.now();
        var newargs =
            extraArgs + " " + (ffmpegVerbose ? "" : "-v warning ") + args;
        var ffmpegInstance = spawn(
            "ffmpeg",
            newargs.replace(/\r?\n/g, "").trim().split(" "),
            {
                shell: true,
            }
        );
        if (ffmpegVerbose)
            log(`Launch Args: ${esc(Color.White)}` + newargs, "ffmpeg");
        var b = "";
        if (!quiet)
            log(
                `${esc(Color.White)}Instance PID: ${ffmpegInstance.pid}`,
                "ffmpeg"
            );
        let outChunked = [];
        ffmpegInstance.stdout.on("data", (c) => {
            outChunked.push(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            if (c.toString().match(ffmpegLogRegex)) return;
            b += c;
        });
        ffmpegInstance.on("exit", (code) => {
            let outBuffer = Buffer.concat(outChunked);
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

export async function ffprobe(
    args: string,
    buffer: [Buffer, string]
): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const ffmpegVerbose = process.env.FFMPEG_VERBOSE == "yes";
        var quiet = false;
        var startTime = Date.now();
        let inFile = addBuffer(buffer[0], getFileExt(buffer[1]));
        args = args.replace(/\$BUF0/g, "http://localhost:56033/" + inFile);
        var ffmpegInstance = spawn("ffprobe", args.split(" "), {
            shell: true,
        });
        var body = "";
        ffmpegInstance.stdout.on("data", (c) => {
            body += c;
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write("[ffprobe] " + c);
        });
        ffmpegInstance.on("exit", (code) => {
            removeBuffer(inFile);
            if (code == 0 && !quiet) {
                if (!quiet && ffmpegVerbose)
                    log(
                        `${esc(Color.Green)}Completed in ${esc(
                            Color.BrightCyan
                        )}${Date.now() - startTime}ms`,
                        "ffprobe"
                    );
                resolve(body);
            } else {
                if (!quiet && ffmpegVerbose)
                    log(
                        `${esc(Color.Red)}Failed in ${esc(Color.BrightCyan)}${
                            Date.now() - startTime
                        }ms`,
                        "ffprobe"
                    );
                reject(body);
            }
        });
    });
}

const videoFormats = ["mp4", "mkv"];
export function usePreset(filename: string) {
    if (videoFormats.includes(getFileExt(filename))) {
        return `-preset ${preset}`;
    }
    return "";
}

export function autoGifPalette(
    in_specifier: string,
    out_specifier: string,
    format: string
) {
    if (format == "gif") {
        return gifPalette(in_specifier, out_specifier);
    } else {
        return `[${in_specifier}]null[${out_specifier}]`;
    }
}

export function gifPalette(in_specifier: string, out_specifier: string) {
    return `[${in_specifier}]split[${in_specifier}_pgen_${out_specifier}][${in_specifier}_puse_${out_specifier}];
    [${in_specifier}_pgen_${out_specifier}]palettegen[${in_specifier}_palette_${out_specifier}];
    [${in_specifier}_puse_${out_specifier}][${in_specifier}_palette_${out_specifier}]paletteuse[${out_specifier}];`;
}

export const DEFAULTFORMAT = {
    IMAGE: "png",
    VIDEO: "mp4",
    AUDIO: "mp3",
    GIF: "gif",
};
