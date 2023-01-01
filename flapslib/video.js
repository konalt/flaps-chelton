const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const { stdout } = require("process");
const { getTextWidth } = require("./canvas");
const twemoji = require("twemoji");
const downloadPromise = require("./download-promise");
const { uuidv4 } = require("./util");
const { extension } = require("mime-types");
const { log, esc, Color } = require("./log");

var ffmpegVerbose = false;

var h264Preset = "ultrafast";
async function ffmpegBuffer(args, buffers, outExt) {
    return new Promise((res, rej) => {
        var opId = uuidv4();
        var files = buffers.map((buf, n) => {
            return file(
                "cache/BUF_" + opId + "_" + n + "." + extension(buf[1])
            );
        });
        var outFile = file("cache/BUF_" + opId + "_FINAL." + outExt);
        files.forEach((filename, i) => {
            fs.writeFileSync(filename, buffers[i][0]);
        });
        args = args.replace(/\$BUF([0-9])+/g, (a, b) => {
            return files[parseInt(b)];
        });
        args = args.replace(/\$OUT/g, outFile);
        ffmpeg(args).then(() => {
            fs.readFile(outFile, (e, data) => {
                if (e) return rej(e);
                res(data);
            });
        });
    });
}
async function ffmpeg(args, quiet = false) {
    return new Promise((resolve, reject) => {
        var startTime = Date.now();
        var ffmpegInstance = cp.spawn(
            "ffmpeg",
            ((ffmpegVerbose ? "" : "-v warning ") + args).split(" "),
            {
                shell: true,
            }
        );
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
            if (code == 0 && !quiet) {
                if (!quiet)
                    log(
                        `${esc(Color.Green)}Completed in ${esc(
                            Color.BrightCyan
                        )}${Date.now() - startTime}ms`,
                        "ffprobe"
                    );
                resolve(body);
            } else {
                if (!quiet)
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
        log(`${esc(Color.White)}Creating image sequence...`, "scalingtable");
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
            log(`${esc(Color.White)}All frames created.`, "scalingtable");
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

var client = null;

function setClient(c) {
    client = c;
}
async function caption2(input, output, options) {
    var advanced = {
        nofix: false,
        invert: false,
        fontsize: 0.1,
        emojisize: 1.3,
    };
    var videoHeight = options.h;
    var videoWidth = options.w;
    videoWidth = Math.round(videoWidth / 2) * 2;
    videoHeight = Math.round(videoHeight / 2) * 2;
    var text = options.text;
    var textArr = text.split(" ");
    textArr.forEach((word, index) => {
        if (!word.startsWith("--")) return;
        var optname = word.split("--")[1].split("=")[0].toLowerCase();
        var optval = (word.split("--")[1].split("=")[1] || "").toLowerCase();
        Object.entries(advanced).forEach((opt) => {
            if (optname == opt[0]) {
                advanced[optname] =
                    optval.length == 0
                        ? true
                        : typeof opt[1] == "number"
                        ? parseFloat(optval)
                        : optval;
                textArr = textArr.filter((x, i) => i != index);
            }
        });
    });
    text = textArr.join(" ");
    var minHeight = 200;
    if (!advanced.nofix && videoHeight < minHeight) {
        videoWidth = minHeight * (videoWidth / videoHeight);
        videoHeight = minHeight;
    }
    var getreal = false;
    if (text == "get real" && getreal)
        text = `I'm tired of people telling me to "get real". Every day I put captions on images for people, some funny and some not, but out of all of those "get real" remains the most used caption. Why? I am simply a computer program running on a server, I am unable to manifest myself into the real world. As such, I'm confused as to why anyone would want me to "get real". Is this form not good enough? Alas, as I am simply a bot, I must follow the tasks that I was originally intended to perform.\n${text}`;
    var baseFontSize = [videoWidth, videoHeight].reduce((a, b) => a + b) / 2;
    var fontSize = Math.round(baseFontSize * advanced.fontsize);
    var fontName = "Futura Condensed Extra";
    var lines = [];
    var currentLine = "";
    var emojiReplacer = "xx";
    var emojiRegex = /(?=\p{Emoji})(?=[\D])(?=[^\*])/gu;
    var customEmojiRegex = /(<a?)?:\w+:(\d+>)/g;
    var txtW = (txt) => getTextWidth(fontName, fontSize, txt);
    var emojiSize = fontSize * advanced.emojisize;
    var fixChar = (c) =>
        c
            .replace(/\\/g, "\\\\\\\\")
            .replace(/'/g, "\u2019")
            .replace(/"/g, '\\\\\\"')
            .replace(/%/g, "\\\\\\%")
            .replace(/:/g, "\\\\\\:")
            .replace(/\n/g, "\\\\\\n");
    textArr.forEach((realword) => {
        var word = "";
        Array.from(realword).forEach((char) => {
            if (char == "\n") {
                lines.push([
                    txtW(currentLine + " " + word),
                    `${currentLine} ${word}`,
                ]);
                currentLine = "";
                word = "";
            } else {
                word += char;
            }
        });
        var textWidth = txtW(
            (currentLine + " " + word).replace(customEmojiRegex, emojiReplacer)
        );
        if (textWidth > videoWidth) {
            lines.push([textWidth, `${currentLine}`]);
            currentLine = "";
        }
        currentLine += " " + word;
    });
    lines.push([
        txtW(currentLine.replace(customEmojiRegex, emojiReplacer)),
        currentLine,
    ]);
    var customEmojis = text.match(customEmojiRegex) || [];
    var emojis = customEmojis.map((x) => [x, true]);
    var newLines = [];
    lines.forEach((line) => {
        var lineYOffset = txtW(
            line[1].replace(customEmojiRegex, emojiReplacer)
        );
        var newWords = [];
        line[1].split(" ").forEach((word) => {
            var newWord = [];
            if (!word) return;
            var chars = [];
            var cached = "";
            var writingCache = false;
            Array.from(word).forEach((char) => {
                if (char == "<") {
                    writingCache = true;
                }
                if (writingCache) {
                    cached += char;
                } else {
                    chars.push(char);
                }
                if (char == ">") {
                    writingCache = false;
                    chars.push(`${cached}`);
                    cached = "";
                }
            });
            chars.forEach((char) => {
                if (char.match(emojiRegex)) {
                    emojis.push([char, false]);
                    newWord.push([emojiSize, char]);
                } else if (char.match(customEmojiRegex)) {
                    newWord.push([emojiSize, char]);
                } else {
                    newWord.push([txtW(char), fixChar(char)]);
                }
            });
            newWords.push(newWord);
        });
        newLines.push([lineYOffset, newWords]);
    });
    emojis = emojis.map((e, i) => {
        if (e[1]) {
            var emoji = client.emojis.cache.find(
                (em) => em.id === e[0].split(":")[2].split(">")[0]
            );
            if (!emoji) {
                return fs.writeFileSync(
                    path.join(__dirname, "..", output + ".emoji." + i + ".png"),
                    fs.readFileSync(path.join(__dirname, "..", "1x1.png"))
                );
            }
            return downloadPromise(
                emoji.url,
                path.join(
                    __dirname,
                    "..",
                    output + ".emoji." + i + (emoji.animated ? ".gif" : ".png")
                )
            );
        } else {
            return downloadPromise(
                twemoji
                    .parse(e[0], { size: Math.floor(72) })
                    .split('src="')[1]
                    .split('"/>')[0],
                path.join(__dirname, "..", output + ".emoji." + i + ".png")
            );
        }
    });
    await Promise.all(emojis);
    var emojiPositions = [];
    var barHeight =
        2 * Math.round(((lines.length + 1) * fontSize + lines.length * 5) / 2);
    var filter = `[0:v]scale=${Math.round(videoWidth / 2) * 2}:${
        Math.round(videoHeight / 2) * 2
    },pad=width=${Math.round(videoWidth / 2) * 2}:height=${
        Math.round(videoHeight / 2) * 2 + barHeight
    }:x=0:y=${barHeight}:color=${advanced.invert ? "black" : "white"},`;
    newLines.forEach((line, index) => {
        var charOffset = videoWidth / 2 - line[0] / 2;
        line[1].forEach((word) => {
            word.forEach((char) => {
                if (
                    char[1].match(emojiRegex) ||
                    char[1].match(customEmojiRegex)
                ) {
                    emojiPositions.push([
                        charOffset,
                        index * (fontSize + 5) + fontSize * 0.4,
                    ]);
                    charOffset += char[0];
                    return;
                }
                filter += `drawtext=fontfile=fonts/futura.otf:fontsize=${fontSize}:text='${
                    char[1]
                }':x=${charOffset}:y=${
                    fontSize + index * (fontSize + 5) + fontSize * 0.4
                }-ascent:fontcolor=${advanced.invert ? "white" : "black"},`;
                charOffset += char[0];
            });
            charOffset += txtW(" ");
        });
    });
    if (filter.endsWith(",")) filter = filter.substring(0, filter.length - 1);
    filter += `[out_captioned];`;
    var emojiInputs = "";
    if (emojis.length > 0) {
        emojiInputs = `-i ${path.join(
            __dirname,
            "..",
            output + ".emoji.%01d.png"
        )} `;
        for (let i = 0; i < emojis.length; i++) {
            filter += `[1:v]select=e=eq(n\\,${i}):n=1,scale=${emojiSize}:${emojiSize},setsar=1:1[scaled_emoji_${i}];`;
            if (i == 0) filter += `[out_captioned]`;
            if (i != 0) filter += `[out_emoji_${i - 1}]`;
            filter += `[scaled_emoji_${i}]overlay=${emojiPositions[i][0]}:${emojiPositions[i][1]}[out_emoji_${i}];`;
        }
        if (filter.endsWith(","))
            filter = filter.substring(0, filter.length - 1);
        if (output.endsWith("gif")) {
            filter += `[out_emoji_${
                emojis.length - 1
            }]split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[out_v]`;
        } else {
            filter += `[out_emoji_${emojis.length - 1}]null[out_v]`;
        }
    } else {
        if (output.endsWith("gif")) {
            filter += `[out_captioned]split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[out_v]`;
        } else {
            filter += `[out_captioned]null[out_v]`;
        }
    }
    fs.writeFileSync(path.join(__dirname, "..", output + ".ffscript"), filter);
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} ${emojiInputs}-filter_complex_script ${path.join(
            __dirname,
            "..",
            output + ".ffscript"
        )} -map "[out_v]" -map "0:a?" -preset:v ${h264Preset} -update 1 ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function mkvmp4(input) {
    return ffmpeg(
        `-y -i ${file(input)} -c:a copy ${file(
            input
                .split(".")
                .slice(0, input.split(".").length - 1)
                .join(".") + ".mp4"
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
async function invert(input, output) {
    return ffmpeg(
        `-y -i ${file(input)} -vf negate -preset:v ${h264Preset} ${file(
            output
        )}`
    );
}
async function blackWhite(input, output) {
    return ffmpeg(
        `-y -i ${file(input)} -vf monochrome -preset:v ${h264Preset} ${file(
            output
        )}`
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
    var txt = `-vf "scale=trunc(iw/10/2)*2:trunc(ih/10/2)*2,framerate=5,scale=trunc(iw*10/2)*2:trunc(ih*10/2)*2" -b:a 5k -ac 1 -ar 16000 -c:a aac -crf:v 51 -b:v 16k`;
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} ${txt} -preset:v ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function reverse(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "reverse,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -af areverse -preset:v ${h264Preset} ${path.join(
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
async function holyMolyGreenscreen(input, output) {
    var dims = await getVideoDimensions(file("holymoly.mp4"));
    var fullFilter = [
        "[0:v]colorkey=0x00FF00:0.2:0.2[ckout]",
        "[1:v]scale=" +
            dims[0] * 0.45 +
            ":" +
            dims[1] / 2 +
            ",pad=" +
            dims.join(":") +
            ":" +
            dims[0] / 6 +
            ":0[img]",
        "[img][ckout]overlay[oout]",
    ].join(";");
    return ffmpeg(
        [
            "-y",
            `-i ${file("holymoly.mp4")}`,
            `${input.endsWith(".png") ? "-loop 0 " : ""}-i ${file(input)}`,
            "-filter_complex " + fullFilter,
            "-shortest",
            '-map "[oout]"',
            '-map "0:a:0"',
            "-preset " + h264Preset,
            output,
        ].join(" ")
    );
}
async function christmasWeek(input, output) {
    var dims = await getVideoDimensions(file("christmas.mp4"));
    var fullFilter = [
        "[1:v]scale=" +
            dims[0] * 0.33 +
            ":" +
            dims[1] / 6 +
            ",format=rgba,pad=" +
            dims.join(":") +
            ":" +
            dims[0] / 10 +
            ":0:black@0[img1]",
        "[1:v]scale=" +
            dims[0] / 2 +
            ":" +
            dims[1] * 0.45 +
            ",format=rgba,pad=" +
            dims.join(":") +
            ":" +
            dims[0] / 2 +
            ":" +
            dims[1] / 3 +
            ":black@0[img2]",
        "[0:v][img1]overlay[oout1]",
        "[oout1][img2]overlay[oout]",
    ].join(";");
    return ffmpeg(
        [
            "-y",
            `-i ${file("christmas.mp4")}`,
            `-i ${file(input[0])}`,
            `-i ${file(input[1])}`,
            "-filter_complex " + fullFilter,
            "-t 18",
            '-map "[oout]"',
            '-map "0:a:0"',
            "-preset " + h264Preset,
            output,
        ].join(" ")
    );
}
async function stack(input, output) {
    var dims = await getVideoDimensions(file(input[0]));
    var fullFilter = [
        "[1:v]scale=" + dims.join(":") + "[img1]",
        "[0:v][img1]overlay[oout]",
    ].join(";");
    return ffmpeg(
        [
            "-y",
            `-i ${file(input[0])}`,
            `-i ${file(input[1])}`,
            "-filter_complex " + fullFilter,
            "-shortest",
            '-map "[oout]"',
            '-map "0:a:0?"',
            "-preset " + h264Preset,
            output,
        ].join(" ")
    );
}
async function stack2(input, output) {
    var dims = (await getVideoDimensions(file(input[0]))).map(
        (n) => Math.ceil(n / 2) * 2
    );
    var fullFilter = [
        `[1:v]scale=${dims.join(":")}[img1]`,
        `[0:v]pad=${dims[0]}:${dims[1] * 2}:0:0:violet[img2]`,
        `[img2][img1]overlay=0:${dims[1]}[oout]`,
    ].join(";");
    return ffmpeg(
        [
            "-y",
            `-i ${file(input[0])}`,
            `-i ${file(input[1])}`,
            "-filter_complex " + fullFilter,
            "-shortest",
            '-map "[oout]"',
            '-map "0:a:0?"',
            "-preset " + h264Preset,
            output,
        ].join(" ")
    );
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
async function getVideoDimensions(path) {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 " +
                path
        )
            .then((txt) => {
                res(txt.split("x").map(parseFloat));
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
async function stitch2(inputs, output) {
    return ffmpeg(
        `-y -i ${file(inputs[0])} -i ${file(
            inputs[1]
        )} -filter_complex "[0:v][1:v]scale2ref[0vy][1vy]; [0vy]setsar=1:1[0v]; [1vy]setsar=1:1[1v]; [0v][0a][1v][1a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -fps_mode vfr ${file(
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
    var files = [
        file(input + (!rev ? "-0." + exts[0] : "-1." + exts[1])),
        file(input + (rev ? "-0." + exts[0] : "-1." + exts[1])),
    ];
    var len = await getVideoLength(files[1]);
    return ffmpeg(
        `-y -loop 1 -i ${files[0]} -i ${
            files[1]
        } -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -preset:v ${h264Preset} -t ${len} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function semiTransparentOverlay(input, output, rev, exts) {
    var files = [
        file(input + (!rev ? "-0." + exts[0] : "-1." + exts[1])),
        file(input + (rev ? "-0." + exts[0] : "-1." + exts[1])),
    ];
    var len = await getVideoLength(files[1]);
    var dims = await getVideoDimensions(files[1]);
    return ffmpeg(
        `-y -loop 1 -i ${files[0]} -i ${files[1]} -filter_complex "[${
            rev ? 0 : 1
        }:v]scale=${dims[0]}:${
            dims[1]
        },format=argb,geq=r='r(X,Y)':a='0.5*alpha(X,Y)'[zork]; [${
            rev ? 1 : 0
        }:v][zork]overlay" -preset:v ${h264Preset} -t ${len} ${path.join(
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
async function gifNoAudio(input, output) {
    return ffmpeg(
        `-y -ignore_loop 1 -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -shortest -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function loop(input, output, options) {
    return ffmpeg(
        `-y -stream_loop ${options.amount - 1} -i ${path.join(
            __dirname,
            "..",
            input
        )} -c:v libx264 -preset:v ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
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

async function camEffect(input, output) {
    return ffmpeg(
        `-y -i ${file(
            input
        )} -filter_complex "[0:v]noise=alls=50:allf=t+u,monochrome[out_v];[0:a]highpass=f=200,lowpass=f=2000[out_a]" -map "[out_a]" -map "[out_v]" ${output}`
    );
}

async function datamosh(input, output) {
    return ffmpeg(`-y -i ${file(input)} -bsf noise=drop=-40 ${output}`);
}

async function compressGIF(input, output) {
    return ffmpeg(
        `-y -i ${file(
            input
        )} -filter_complex "[0:v]scale=64:64,fps=8[a];[0:v]palettegen[b];[a][b]paletteuse[c]" -map "[c]" ${output}`
    );
}

module.exports = {
    addText,
    simpleMemeCaption,
    imageAudio,
    geq,
    stretch,
    squash,
    trim,
    stitch,
    videoAudio,
    videoGif,
    armstrongify,
    setArmstrongSize,
    complexFFmpeg,
    baitSwitch,
    mimeNod,
    gifAudio,
    compress,
    caption2,
    reverse,
    theHorror,
    parseScalingTable,
    stewie,
    bassBoost,
    cookingVideo,
    speed,
    invert,
    setClient,
    mkvmp4,
    stitch2,
    semiTransparentOverlay,
    ffmpegBuffer,
    getVideoDimensions,
    getVideoLength,
    getFrameCount,
    blackWhite,
    camEffect,
    datamosh,
    compressGIF,
    gifNoAudio,
    loop,
    holyMolyGreenscreen,
    christmasWeek,
    stack,
    stack2,
};
