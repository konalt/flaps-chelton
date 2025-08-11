import { spawn } from "child_process";
import { readFile, writeFileSync } from "fs";
import { extension } from "mime-types";
import { C, log } from "../logger";
import { getFileExt, scheduleDelete, uuidv4 } from "../utils";
import { join } from "path";
import { stdout } from "process";
import { addBuffer, addBufferSequence, removeBuffer } from "../..";
import { FFmpegPercentUpdate } from "../../types";
import os, { setPriority } from "os";
import WebSocket from "ws";
import { getVideoLength } from "./getVideoDimensions";

const extraArgs = "";

export const preset = "veryfast";

export function file(pathstr: string) {
    return join(".", pathstr.includes("images") ? "" : "images", pathstr);
}

function getOutputFormat(ext: string) {
    if (ext == "png") {
        return "-frames:v 1 -f image2 -c png";
    }
    if (ext == "jpeg" || ext == "jpg") {
        return "-frames:v 1 -f image2 -c mjpeg";
    }
    if (ext == "mp4") {
        return "-pix_fmt yuv420p -f mp4 -movflags faststart+frag_keyframe+empty_moov";
    }
    return "-f " + ext;
}

export function ffmpegBuffer(
    args: string,
    buffers: [Buffer, string][],
    outExt?: string,
    forceVerbose = false,
    updateFn: (update: FFmpegPercentUpdate) => void = () => {
        void 0;
    },
    expectedResultLengthFrames = 1,
    useServerIfAvailable = false
): Promise<Buffer> {
    return new Promise<Buffer>(async (resolve, reject) => {
        if (useServerIfAvailable) {
            log("Connecting to FFmpeg server...", "ffmpeg");
            let isAvailable = await fetch(
                `${process.env.FLAPS_FFMPEG_SERVER_HEALTH_HOST}/health`,
                { signal: AbortSignal.timeout(3000) }
            )
                .then(() => {
                    return true;
                })
                .catch(() => {
                    return false;
                });
            log("Server available: " + isAvailable, "ffmpeg");
            if (isAvailable) {
                const ws = new WebSocket(process.env.FLAPS_FFMPEG_SERVER_HOST);
                ws.on("error", console.error);
                ws.on("message", (data_str) => {
                    let data = JSON.parse(data_str.toString());
                    switch (data.type) {
                        case "ready":
                            ws.send(
                                JSON.stringify({
                                    type: "run",
                                    args: args,
                                    buffers: buffers,
                                    outExt: outExt,
                                    enableUpdateStreaming: !!updateFn,
                                    expectedResultLengthFrames:
                                        expectedResultLengthFrames,
                                })
                            );
                            break;
                        case "update":
                            if (!!updateFn) {
                                updateFn(data.update);
                            }
                            break;
                        case "error":
                            reject(data.detail);
                            break;
                        case "done":
                            resolve(Buffer.from(data.buffer.data));
                            break;
                    }
                });
                return;
            }
        }
        const ffmpegVerbose =
            forceVerbose || process.env.FFMPEG_VERBOSE == "yes";
        if (!outExt) outExt = getFileExt(buffers[0][1]);
        outExt = outExt.toLowerCase();
        let verbosityArg =
            !!updateFn || ffmpegVerbose ? "-v info" : "-v warning";
        let newargs = (
            verbosityArg +
            " -hide_banner " +
            args
                .replace(/\r?\n/g, " ")
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

        if (ffmpegVerbose) log(`Launch Args: ${C.White}` + newargs, "ffmpeg");

        const childProcess = spawn("ffmpeg", newargs.split(" "), {
            shell: true,
        });
        let chunkedOutput = [];
        let errorLog = "ARGS: ffmpeg " + newargs + "\n";
        childProcess.stdout.on("data", (chunk: Buffer) => {
            chunkedOutput.push(chunk);
        });
        childProcess.stderr.on("data", (chunk: Buffer) => {
            errorLog += chunk;
            if (ffmpegVerbose) {
                process.stdout.write(chunk);
            }
            if (!!updateFn && chunk.toString().startsWith("frame=")) {
                let pChunk = chunk.toString();
                let frame = parseInt(pChunk.split("=")[1]);
                let fps = parseFloat(pChunk.split("=")[2]);
                let time = pChunk.split("=")[5].split(" ")[0];
                let speed = parseFloat(pChunk.split("=")[7]);
                let percent = (frame / expectedResultLengthFrames) * 100;
                let update: FFmpegPercentUpdate = {
                    fps,
                    frame,
                    time,
                    speed,
                    percent,
                };
                updateFn(update);
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
        if (ffmpegVerbose) log(`Launch Args: ${C.White}` + newargs, "ffmpeg");
        var b = "";
        if (!quiet)
            log(`${C.White}Instance PID: ${ffmpegInstance.pid}`, "ffmpeg");
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
                    `${C.Green}Completed ${C.White}in ${C.BCyan}${
                        Date.now() - startTime
                    }ms`,
                    "ffmpeg"
                );
                resolve(args.split(" ").pop());
            } else {
                if (!quiet)
                    log(
                        `${C.Red}Failed ${C.White}in ${C.BCyan}${
                            Date.now() - startTime
                        }ms`,
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
                        `${C.Green}Completed in ${C.BCyan}${
                            Date.now() - startTime
                        }ms`,
                        "ffprobe"
                    );
                resolve(body);
            } else {
                if (!quiet && ffmpegVerbose)
                    log(
                        `${C.Red}Failed in ${C.BCyan}${
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

export const SCALE_EVEN = `scale=trunc(iw/2)*2:trunc(ih/2)*2`;

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
    [${in_specifier}_puse_${out_specifier}][${in_specifier}_palette_${out_specifier}]paletteuse[${out_specifier}]`;
}

export async function imageSequenceToVideo(
    sequence: Buffer[],
    fps: number,
    audio?: Buffer
): Promise<Buffer> {
    let duration = sequence.length * fps;
    let sequenceReference = addBufferSequence(sequence, "png");
    if (audio) {
        duration = await getVideoLength([audio, "mp3"]);
    }
    let video = await ffmpegBuffer(
        `${
            audio ? "-loop 1 " : ""
        }-pattern_type sequence -r ${fps} -f image2 -i http://localhost:56033/${sequenceReference} ${
            audio ? "-i $BUF0" : "-an"
        } -t ${duration} $PRESET $OUT`,
        audio ? [[audio, "mp3"]] : [],
        "mp4"
    );
    removeBuffer(sequenceReference);
    return video;
}

export function overlayFilter(
    bottomSpec: string,
    topSpec: string,
    outSpec: string,
    x: number,
    y: number,
    width: number,
    height: number,
    jiggle = 0
) {
    let jiggleEquation = jiggle > 0 ? `+(random(0)-0.5)*${jiggle}` : "";
    let jiggleEval = jiggle > 0 ? ":eval=frame" : "";
    return `[${topSpec}]scale=${width}:${height}[o];[${bottomSpec}][o]overlay='${x}${jiggleEquation}:${y}${jiggleEquation}${jiggleEval}'[${outSpec}]`;
}

export const DEFAULTFORMAT = {
    IMAGE: "png",
    VIDEO: "mp4",
    AUDIO: "mp3",
    GIF: "gif",
};
