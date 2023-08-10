import { writeFileSync } from "fs";
import path from "path";
import { Caption2Options } from "../../types";
import { getFileExt, twemojiURL, uuidv4 } from "../utils";
import { downloadPromise } from "../download";
import { ffmpegBuffer, file, preset, usePreset } from "./ffmpeg";
import getTextWidth from "../canvas/getTextWidth";
import { getVideoDimensions } from "./getVideoDimensions";

async function caption2(
    buffers: [Buffer, string][],
    options: Caption2Options
): Promise<Buffer> {
    let output = "cache/" + uuidv4();
    var advanced = {
        nofix: false,
        invert: false,
        fontsize: 0.1,
        emojisize: 1.3,
        vcrosdmono: false,
    };
    let dims = await getVideoDimensions(buffers[0][1]);
    var videoHeight = dims[1];
    var videoWidth = dims[0];
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
    var fontName = advanced.vcrosdmono
        ? "VCR OSD Mono"
        : "Futura Condensed Extra";
    var lines: any[][] = [];
    var currentLine = "";
    var emojiReplacer = "xx";
    var emojiRegex = /(?=\p{Emoji})(?=[\D])(?=[^\*])/gu;
    var customEmojiRegex = /(<a?)?:\w+:(\d+>)/g;
    var fontChangeRegex = /\*[\w\d]+\*/g;
    var txtW = (txt, fnt = fontName) => getTextWidth(fnt, fontSize, txt);
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
    var newLines: any[][] = [];
    var mods: any[][] = [];
    var lindex = 0;
    lines.forEach((line) => {
        var lineYOffset = txtW(
            line[1].replace(customEmojiRegex, emojiReplacer)
        );
        var newWords: any[][] = [];
        line[1].split(" ").forEach((word) => {
            var newWord: any[][] = [];
            if (!word) return;
            var chars: any[] = [];
            var cached = "";
            var writingCache = false;
            var ml = mods.length;
            if (word.startsWith("*")) {
                mods.push([parseInt((lindex + ml).toString()), "FontVCR"]);
                word = word.substring(1);
            }
            if (word.endsWith("*")) {
                mods.push([
                    parseInt((lindex + word.length - 1 + ml).toString()),
                    "FontDefault",
                ]);
                word = word.substring(word.length - 1);
            }
            var mod = mods.find((m) => m[0] == lindex);
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
                lindex++;
            });
            chars.forEach((char) => {
                if (char.match(emojiRegex)) {
                    emojis.push([char, false]);
                    newWord.push([emojiSize, char]);
                } else if (char.match(customEmojiRegex)) {
                    newWord.push([emojiSize, char]);
                } else {
                    newWord.push([
                        txtW(
                            char,
                            mod
                                ? mod[1] == "FontVCR"
                                    ? "Arial"
                                    : fontName
                                : fontName
                        ),
                        fixChar(char),
                    ]);
                }
            });
            newWords.push(newWord);
        });
        newLines.push([lineYOffset, newWords]);
    });
    let emojis2 = emojis.map((e, i) => {
        if (e[1]) {
            var url =
                "https://cdn.discordapp.com/emojis/" +
                e[0].split(":")[2].split(">")[0] +
                ".png";
            return downloadPromise(url, file(output + ".emoji." + i + ".png"));
        } else {
            return downloadPromise(
                twemojiURL(e[0]),
                file(output + ".emoji." + i + ".png")
            );
        }
    });
    await Promise.all(emojis2);
    var emojiPositions: any[][] = [];
    var barHeight =
        2 * Math.round(((lines.length + 1) * fontSize + lines.length * 5) / 2);
    var filter = `[0:v]scale=${Math.round(videoWidth / 2) * 2}:${
        Math.round(videoHeight / 2) * 2
    },pad=width=${Math.round(videoWidth / 2) * 2}:height=${
        Math.round(videoHeight / 2) * 2 + barHeight
    }:x=0:y=${barHeight}:color=${advanced.invert ? "black" : "white"},`;
    var cusevcr = false;
    newLines.forEach((line, index) => {
        var charOffset = videoWidth / 2 - line[0] / 2;
        var lindex = 0;
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
                var mod = mods.find((m) => m[0] == lindex);
                if (mod && mod[1] == "FontVCR") cusevcr = true;
                if (mod && mod[1] == "FontDefault") cusevcr = false;
                filter += `drawtext=fontfile=fonts/${
                    cusevcr ? "arial.ttf" : "futura.otf"
                }:fontsize=${fontSize}:text='${char[1]}':x=${charOffset}:y=${
                    fontSize + index * (fontSize + 5) + fontSize * 0.4
                }-ascent:fontcolor=${advanced.invert ? "white" : "black"},`;
                lindex++;
                charOffset += char[0];
            });
            charOffset += txtW(" ");
        });
    });
    if (filter.endsWith(",")) filter = filter.substring(0, filter.length - 1);
    filter += `[out_captioned];`;
    var emojiInputs = "";
    if (emojis.length > 0) {
        emojiInputs = `-i ${file(output + ".emoji.%01d.png")} `;
        for (let i = 0; i < emojis.length; i++) {
            filter += `[1:v]select=e=eq(n\\,${i}):n=1,scale=${emojiSize}:${emojiSize},setsar=1:1[scaled_emoji_${i}];`;
            if (i == 0) filter += `[out_captioned]`;
            if (i != 0) filter += `[out_emoji_${i - 1}]`;
            filter += `[scaled_emoji_${i}]overlay=${emojiPositions[i][0]}:${emojiPositions[i][1]}[out_emoji_${i}];`;
        }
        if (filter.endsWith(","))
            filter = filter.substring(0, filter.length - 1);
        if (getFileExt(buffers[0][1]) == "gif") {
            filter += `[out_emoji_${
                emojis.length - 1
            }]split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[out_v]`;
        } else {
            filter += `[out_emoji_${emojis.length - 1}]null[out_v]`;
        }
    } else {
        if (getFileExt(buffers[0][1]) == "gif") {
            filter += `[out_captioned]split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse[out_v]`;
        } else {
            filter += `[out_captioned]null[out_v]`;
        }
    }
    writeFileSync(file(output + ".ffscript"), filter);
    return ffmpegBuffer(
        `-y -i $BUF0 ${emojiInputs}-filter_complex_script ${file(
            output + ".ffscript"
        )} -map "[out_v]" -map "0:a?" ${usePreset(
            buffers[0][1]
        )} -update 1 $OUT`,
        buffers,
        getFileExt(buffers[0][1])
    );
}

export default caption2;
