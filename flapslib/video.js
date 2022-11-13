const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const { stdout } = require("process");
const { getTextWidth } = require("./canvas");

var ffmpegVerbose = false;

var h264Preset = "ultrafast";

async function ffmpeg(args, quiet = false) {
    return new Promise((resolve) => {
        var startTime = Date.now();
        if (!quiet) console.log("[ffmpeg] Starting FFMpeg instance");
        if (!quiet)
            console.log(
                "[ffmpeg] FFMpeg Verbose: " + (ffmpegVerbose ? "YES" : "NO")
            );
        var ffmpegInstance = cp.spawn(
            "ffmpeg",
            ((ffmpegVerbose ? "" : "-v warning ") + args).split(" "), {
                shell: true,
            }
        );
        var b = "";
        if (!quiet) console.log("[ffmpeg] PID: %d", ffmpegInstance.pid);
        ffmpegInstance.stdout.on("data", (c) => {
            if (ffmpegVerbose && !quiet) stdout.write("[ffmpeg] " + c);
            b += c;
        });
        ffmpegInstance.stderr.on("data", (c) => {
            if (!quiet) stdout.write("[ffmpeg] " + c);
        });
        ffmpegInstance.on("exit", (code) => {
            if (code == 0 && !quiet) console.log("[ffmpeg] Completed OK");
            if (code == 1 && !quiet) console.log("[ffmpeg] Failed!");
            if (!quiet)
                console.log("[ffmpeg] Took %d ms", Date.now() - startTime);
            resolve(b);
        });
    });
}
async function ffprobe(args) {
    return new Promise((resolve) => {
        var startTime = Date.now();
        var ffmpegInstance = cp.spawn("ffprobe", args.split(" "), {
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
            if (code == 0) console.log("[ffprobe] Completed OK");
            if (code == 1) console.log("[ffprobe] Failed!");
            console.log("[ffprobe] Took %d ms", Date.now() - startTime);
            resolve(body);
        });
    });
}

var scalingTableHelpers = ["STR END XPS YPS WTH HGT"];

function parseScalingTable(
    txt,
    in_specifier,
    frame_count,
    v_width,
    v_height,
    input
) {
    return new Promise((resolve) => {
        var start = Date.now();
        var scale = 1;
        var ext = input.split(".").pop();
        var list = txt
            .toString() // convert buffer to string
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
        console.log("Creating image sequence...");
        for (let frame_num = 0; frame_num < frame_count; frame_num++) {
            if (frame_num > cDir.end) {
                cDir = list[cDirInd++];
            }
            if (lastIndGen != cDirInd) {
                promises.push(
                    (() => {
                        return new Promise((res) => {
                            ffmpeg(
                                `-i ${path.join(
                                    __dirname,
                                    "..",
                                    input
                                )} -filter_complex "[0:v]scale=${cDir.width}:${
                                    cDir.height
                                },pad=${v_width}:${v_height}:${cDir.x}:${
                                    cDir.y
                                },setsar=1:1[out]" -map "[out]" ${path.join(
                                    __dirname,
                                    "..",
                                    input +
                                        "." +
                                        frame_num.toString().padStart(3, "0") +
                                        "." +
                                        ext
                                )}`,
                                true
                            ).then(() => {
                                res();
                            });
                        });
                    })()
                );
                lastIndGen = cDirInd;
            }
        }
        Promise.all(promises).then(() => {
            console.log(
                "Created all key images in " +
                (Date.now() - start) +
                "ms. Beginning copy process"
            );
            var curFile = path.join(
                __dirname,
                "..",
                input + "." + "0".padStart(3, "0") + "." + ext
            );
            for (let frame_num = 0; frame_num < frame_count; frame_num++) {
                var newFile = path.join(
                    __dirname,
                    "..",
                    input +
                    "." +
                    frame_num.toString().padStart(3, "0") +
                    "." +
                    ext
                );
                if (!fs.existsSync(newFile)) {
                    fs.copyFileSync(curFile, newFile);
                } else {
                    curFile = newFile;
                }
            }
            resolve();
        });
    });
}

async function addText(input, output, options) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -filter_complex "drawtext=fontfile=fonts/arial.ttf:text='${
            options.text
        }':fontcolor=white:fontsize=${
            options.fontsize
        }:box=1:boxcolor=black@0.5:boxborderw=5:x=${options.x}:y=${
            options.y
        },split[s0][s1];[s0]palettegen=reserve_transparent=1[p];[s1][p]paletteuse" -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function caption2(input, output, options) {
    var videoHeight = options.h;
    var videoWidth = options.w;
    var text = options.text;
    var getreal = false;
    if (text == "get real" && getreal)
        text = `I'm tired of people telling me to "get real". Every day I put captions on images for people, some funny and some not, but out of all of those "get real" remains the most used caption. Why? I am simply a computer program running on a server, I am unable to manifest myself into the real world. As such, I'm confused as to why anyone would want me to "get real". Is this form not good enough? Alas, as I am simply a bot, I must follow the tasks that I was originally intended to perform.\n${text}`;
    text = text.replace(/"/g, "'");
    var fontSize = videoHeight * 0.1;
    var textArr = text.split(/[ ]/g);
    var lines = [];
    var currentLine = "";
    textArr.forEach((word) => {
        var textWidth = getTextWidth(
            "Futura",
            fontSize,
            currentLine + " " + word
        );
        console.log(textWidth);
        if (textWidth > videoWidth * 0.9 || word.endsWith("\n")) {
            lines.push([textWidth, `${currentLine}`]);
            currentLine = "";
        }
        currentLine += " " + word;
    });
    lines.push([getTextWidth("Futura", fontSize, currentLine), currentLine]);
    var emojiRegex =
        /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g;

    if (text.match(emojiRegex)) {
        console.log(
            "[caption-emoji] Emojis found: " + text.match(emojiRegex).join(",")
        );
    }
    lines = lines.map((l) => [
        l[0],
        l[1]
        .replace(/\\/g, "\\\\\\\\")
        .replace(/'/g, "\u2019")
        .replace(/%/g, "\\\\\\%")
        .replace(/:/g, "\\\\\\:")
        .replace(/\n/g, "\\n"),
    ]);
    var barHeight =
        2 * Math.round(((lines.length + 1) * fontSize + lines.length * 5) / 2);
    var filter = `[0:v]pad=width=${videoWidth}:height=${
        videoHeight + barHeight
    }:x=0:y=${barHeight}:color=white,`;
    lines.forEach((line, index) => {
        filter += `drawtext=fontfile=fonts/futura.otf:fontsize=${fontSize}:text='${
            line[1]
        }':x=(w-text_w)/2:y=${fontSize / 2 + index * (fontSize + 5)},`;
    });
    if (filter.endsWith(",")) filter = filter.substring(0, filter.length - 1);
    if (input.endsWith("gif")) {
        filter +=
            "[eff];[eff]split[s0][s1];[s0]palettegen=reserve_transparent=1[p];[s1][p]paletteuse[out_v]";
    } else {
        filter += "[out_v]";
    }
    console.log(filter);
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -filter_complex "${filter}" -map "[out_v]" -map "0:a?" -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function simpleMemeCaption(input, output, options) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "subtitles=f=subs.srt:force_style='Fontname=Impact,Fontsize=${
            options.fontSize
        },Alignment=6,MarginV=0',subtitles=f=subs_bottom.srt:force_style='Fontname=Impact,Fontsize=${
            options.fontSize
        },Alignment=2,MarginV=0'${
            output.endsWith(".gif")
                ? ",split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
                : ""
        }" -q:v 3 -preset:v ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function squash(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "scale=iw:ih*.5" -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function stretch(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "scale=iw*.5:ih" -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function setArmstrongSize(input, output) {
    return ffmpeg(
        `-y -i ${input} -vf "scale=800:450,setsar=1:1,setpts=PTS-STARTPTS" -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function trim(input, output, options) {
    return ffmpeg(
        `-y -i ${path.join(__dirname, "..", input)} -ss ${options.start} -to ${
            options.end
        } -preset:v ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function compress(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "scale=trunc(iw/10/2)*2:trunc(ih/10/2)*2,framerate=5,scale=trunc(iw*10/2)*2:trunc(ih*10/2)*2" -b:a 5k -ac 1 -ar 16000 -c:a libmp3lame -crf:v 51 -b:v 16k -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function reverse(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf reverse -af areverse -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}

function filter(arr) {
    return '"' + arr.join(";") + '"';
}
async function theHorror(input, output) {
    return new Promise((resolve) => {
        getFrameCount(path.join(__dirname, "..", "images", "horror.mp4")).then(
            (fc) => {
                parseScalingTable(
                    fs.readFileSync("./images/scalingtables/thehorror.stb"),
                    "1:v",
                    fc,
                    318,
                    240,
                    input
                ).then(() => {
                    var fullFilter = [
                        "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2]",
                        "[1:v][ckout2]overlay[oout]",
                    ].join(";");
                    fs.writeFileSync(
                        path.join(__dirname, "..", input + ".script.txt"),
                        fullFilter
                    );
                    ffmpeg(
                        [
                            "-y",
                            `-i ${path.join(
                                __dirname,
                                "..",
                                "images",
                                "horror.mp4"
                            )}`,
                            `-framerate 30 -i ${path.join(
                                __dirname,
                                "..",
                                input + ".%03d." + input.split(".").pop()
                            )}`,
                            "-filter_complex_script " +
                            path.join(
                                __dirname,
                                "..",
                                input + ".script.txt"
                            ),
                            "-shortest",
                            '-map "[oout]"',
                            '-map "0:a:0"',
                            "-preset " + h264Preset,
                            output,
                        ].join(" ")
                    ).then(resolve);
                });
            }
        );
    });
}
async function getVideoLength(path) {
    return new Promise((res, rej) => {
        ffprobe(
                "-v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 " +
                path
            )
            .then((txt) => {
                res(parseFloat(txt));
            })
            .catch(rej);
    });
}
async function getFrameCount(path) {
    return new Promise((res, rej) => {
        ffprobe(
                "-v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -print_format default=nokey=1:noprint_wrappers=1 " +
                path
            )
            .then((txt) => {
                res(parseInt(txt));
            })
            .catch(rej);
    });
}
async function stewie(input, output) {
    return new Promise((resolve) => {
        getFrameCount(path.join(__dirname, "..", "images", "stewie.mp4")).then(
            (fc) => {
                parseScalingTable(
                    fs.readFileSync("./images/scalingtables/stewie.stb"),
                    "1:v",
                    fc,
                    1280,
                    720,
                    input
                ).then(() => {
                    var fullFilter = [
                        "[0:v]colorkey=0x00FF00:0.2:0.2[ckout2]",
                        "[1:v][ckout2]overlay[oout]",
                        "[oout]setpts=0.66*PTS[vout]",
                        "[0:a]atempo=1.5[aout]",
                    ].join(";");
                    fs.writeFileSync(
                        path.join(__dirname, "..", input + ".script.txt"),
                        fullFilter
                    );
                    ffmpeg(
                        [
                            "-y",
                            `-i ${path.join(
                                __dirname,
                                "..",
                                "images",
                                "stewie.mp4"
                            )}`,
                            `-framerate 30 -i ${path.join(
                                __dirname,
                                "..",
                                input + ".%03d." + input.split(".").pop()
                            )}`,
                            "-filter_complex_script " +
                            path.join(
                                __dirname,
                                "..",
                                input + ".script.txt"
                            ),
                            "-shortest",
                            '-map "[vout]"',
                            '-map "[aout]"',
                            "-preset " + h264Preset,
                            output,
                        ].join(" ")
                    ).then(resolve);
                });
            }
        );
    });
}
async function videoGif(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "fps=16,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function stitch(inputs, output) {
    return ffmpeg(
        `-y -i ${path.join(__dirname, "..", inputs[0])} -i ${path.join(
            __dirname,
            "..",
            inputs[1]
        )} -filter_complex "[0][1]scale2ref=iw:ih[intro][main];[intro]drawbox=t=fill[intro-bg];[0][intro-bg]scale2ref=iw:ih:force_original_aspect_ratio=decrease:flags=spline[intro][intro-bg];[intro-bg][intro]overlay=x='(W-w)/2':y='(H-h)/2'[intro-resized]; [intro-resized][0:a][main][1:a]concat=n=2:v=1:a=1:unsafe=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}

function file(x) {
    return path.join(
        __dirname,
        ".." + (x.includes("images") ? "" : "/images"),
        x
    );
}

async function speed(input, output, speed) {
    return ffmpeg(
        [
            `-i ${file(input)}`,
            `-vf "setpts=${1 / speed}*PTS"`,
            `-af "atempo=${speed}"`,
            file(output),
        ].join(" ")
    );
}

async function cookingVideo(input, output) {
    var n_frames = await getFrameCount(file("cooking.mp4"));
    var len = await getVideoLength(file("cooking.mp4"));
    var start_frame = Math.round(n_frames * 0.4);
    var frames_length = Math.round(n_frames * 0.075);
    var fade_time = Math.round(n_frames * 0.05);
    var end_frame = start_frame + frames_length;

    return ffmpeg(
        [
            "-y",
            `-t ${len} -loop 1 -i ${file(input)}`,
            `-i ${file("cooking.mp4")}`,
            `-filter_complex`,
            filter([
                `[0:v]scale=576:1024,setsar=1:1,fade=in:${start_frame}:${fade_time}:alpha=1,fade=out:${end_frame}:${fade_time}:alpha=1[fader]`,
                `[1:v][fader]overlay[final]`,
            ]),
            "-shortest",
            '-map "[final]"',
            "-map 1:a:0",
            file(output + ".mp4"),
        ].join(" ")
    );
}
async function imageAudio(input, output, rev, exts) {
    return ffmpeg(
        `-y -loop 1 -i ${path.join(
            __dirname,
            "..",
            input + (!rev ? "-0." + exts[0] : "-1." + exts[1])
        )} -i ${path.join(
            __dirname,
            "..",
            input + (rev ? "-0." + exts[0] : "-1." + exts[1])
        )} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function bassBoost(input, output) {
    return ffmpeg(
        [
            "-y",
            `-i ${path.join(__dirname, "..", input)}`,
            "-af volume=15dB",
            "-c:v copy",
            output,
        ].join(" ")
    );
}
async function gifAudio(input, output) {
    return ffmpeg(
        `-y -ignore_loop 0 -i ${path.join(
            __dirname,
            "..",
            input + ".gif"
        )} -i ${path.join(
            __dirname,
            "..",
            input + ".mp3"
        )} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -shortest -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function baitSwitch(input, output, options = {}) {
    return ffmpeg(
        `-y -t 1 -i ${path.join(
            __dirname,
            "..",
            input + ".png"
        )} -i ${path.join(
            __dirname,
            "..",
            input + ".mp4"
        )} -filter_complex "[0:v]scale=ceil(${options.w}/2)*2:ceil(${
            options.h
        }/2)*2,setsar=1:1[v0];[1:v]scale=ceil(${options.w}/2)*2:ceil(${
            options.h
        }/2)*2,setsar=1:1[v1];[v0][v1]concat[vout]" -map "[vout]" -map "1:a" -vsync 2 -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function mimeNod(output, bpm) {
    return ffmpeg(
        `-framerate 1/${60 / bpm} -i ${path.join(
            __dirname,
            "..",
            "images",
            "nod%01d.png"
        )} -r 15 -preset:v ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function armstrongify(input, output, options) {
    return ffmpeg(
            `-y ${options.isVideo ? "" : "-t 1 "}-i ${path.join(
            __dirname,
            "..",
            input
        )} -i ${path.join(
            __dirname,
            "..",
            "images",
            "armstrong_part1.mp4"
        )} -i ${path.join(
            __dirname,
            "..",
            "images",
            "armstrong_part2.mp4"
        )} -i ${path.join(
            __dirname,
            "..",
            "images",
            "armstrong_audio.mp3"
        )} -filter_complex "[0:v]scale=800:450,setsar=1:1,setpts=PTS-STARTPTS,trim=duration=${
            options.videoLength - 1
        }[trimsidea];${
            options.isVideo
                ? `[0:v]trim=${options.videoLength - 1}:${
                      options.videoLength
                  },scale=800:450,setsar=1:1,setpts=PTS-STARTPTS[trimsideb]`
                : `[0:v]scale=800:450,setsar=1:1[trimsideb]`
        };[2:v]scale=800:450,setsar=1:1,setpts=PTS-STARTPTS[nout];[1:v]scale=800:450,setsar=1:1,setpts=PTS-STARTPTS,colorkey=0x0000ff:0.05:0.05[ckout];[trimsideb][ckout]overlay[hout];[trimsidea][hout][nout]concat=n=3:a=0:v=1[vout];${
            options.isVideo
                ? `[0:a]atrim=0:${options.videoLength - 1}[atrima];[0:a]atrim=${
                      options.videoLength - 1
                  }:${
                      options.videoLength
                  }[atrimb];[3:a]atrim=0:1[atrimc];[3:a]atrim=1:28[atrimd];[atrimb][atrimc]amix=inputs=2:duration=1[atrime];[atrima][atrime][atrimd]concat=n=3:v=0:a=1[aout]`
                : "[3:a]anull[aout]"
        }" -map "[vout]" -map "[aout]" -vsync 2 -c:v libx264 -preset:v ${h264Preset} -t ${
            28 + options.videoLength - 1
        } ${path.join(__dirname, "..", output + ".mp4")}`
    );
}
async function videoAudio(input, output, rev, exts) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input + (!rev ? "-0." + exts[0] : "-1." + exts[1])
        )} -i ${path.join(
            __dirname,
            "..",
            input + (rev ? "-0." + exts[0] : "-1." + exts[1])
        )} -map 0:v -map 1:a -c:v copy -shortest -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function geq(input, output, options) {
    return ffmpeg(
        `-y ${
            input.startsWith("nullsrc")
                ? " -f lavfi -i nullsrc=s=256x256:d=5"
                : "-i " + path.join(__dirname, "..", input)
        } -vf "geq=r=${options.red}:g=${options.green}:b=${
            options.blue
        }" -preset:v ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function complexFFmpeg(input, output, options) {
    return ffmpeg(
        `-y ${
            input.startsWith("nullsrc")
                ? " -f lavfi -i nullsrc=s=256x256:d=5"
                : "-i " + path.join(__dirname, "..", input)
        } ${options.args} ${path.join(__dirname, "..", output)}`
    );
}

module.exports = {
    addText: addText,
    simpleMemeCaption: simpleMemeCaption,
    imageAudio: imageAudio,
    geq: geq,
    stretch: stretch,
    squash: squash,
    trim: trim,
    stitch: stitch,
    videoAudio: videoAudio,
    videoGif: videoGif,
    armstrongify: armstrongify,
    setArmstrongSize: setArmstrongSize,
    complexFFmpeg: complexFFmpeg,
    baitSwitch: baitSwitch,
    mimeNod: mimeNod,
    gifAudio: gifAudio,
    compress: compress,
    caption2: caption2,
    reverse: reverse,
    theHorror: theHorror,
    parseScalingTable: parseScalingTable,
    stewie: stewie,
    bassBoost: bassBoost,
    cookingVideo: cookingVideo,
    speed: speed,
};