const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const { stdout } = require("process");
const { uuidv4 } = require("./ai");
const { getTextWidth } = require("./canvas");

var ffmpegVerbose = false;

var h264Preset = "ultrafast";

async function ffmpeg(args) {
    return new Promise((resolve, reject) => {
        var startTime = Date.now();
        console.log("[ffmpeg] Starting FFMpeg instance");
        console.log(
            "[ffmpeg] FFMpeg Verbose: " + (ffmpegVerbose ? "YES" : "NO")
        );
        var ffmpegInstance = cp.spawn(
            "ffmpeg",
            ((ffmpegVerbose ? "" : "-v warning ") + args).split(" "), {
                shell: true,
            }
        );
        console.log("[ffmpeg] PID: %d", ffmpegInstance.pid);
        ffmpegInstance.stdout.on("data", (c) => {
            if (ffmpegVerbose) stdout.write("[ffmpeg] " + c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write("[ffmpeg] " + c);
        });
        ffmpegInstance.on("exit", (code) => {
            if (code == 0) console.log("[ffmpeg] Completed OK");
            if (code == 1) console.log("[ffmpeg] Failed!");
            console.log("[ffmpeg] Took %d ms", Date.now() - startTime);
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
        )} -filter_complex "drawtext=fontfile=arial.ttf:text='${
            options.text
        }':fontcolor=white:fontsize=${
            options.fontsize
        }:box=1:boxcolor=black@0.5:boxborderw=5:x=${options.x}:y=${
            options.y
        },split[s0][s1];[s0]palettegen=reserve_transparent=1[p];[s1][p]paletteuse" -preset ${h264Preset} ${path.join(
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
    var fontSize = videoHeight * 0.1;
    var textArr = text.split(/[ \n]/g);
    var lines = [];
    var currentLine = "";
    textArr.forEach((word) => {
        var textWidth = getTextWidth(
            "Futura",
            fontSize,
            currentLine + " " + word
        );
        console.log(textWidth);
        if (textWidth > videoWidth) {
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
    var barHeight = lines.length * fontSize + fontSize;
    var filter = `[0:v]pad=width=${videoWidth}:height=${
        videoHeight + barHeight
    }:x=0:y=${barHeight}:color=white,`;
    lines.forEach((line, index) => {
        filter += `drawtext=fontfile=futura.otf:fontsize=${fontSize}:text='${
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
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -filter_complex "${filter}" -map "[out_v]" -map "0:a?" -preset ${h264Preset} ${path.join(
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
        }" -q:v 3 -preset ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function squash(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "scale=iw:ih*.5" -preset ${h264Preset} ${path.join(
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
        )} -vf "scale=iw*.5:ih" -preset ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function setArmstrongSize(input, output) {
    return ffmpeg(
        `-y -i ${input} -vf "scale=800:450,setsar=1:1,setpts=PTS-STARTPTS" -preset ${h264Preset} ${path.join(
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
        } -preset ${h264Preset} ${path.join(__dirname, "..", output)}`
    );
}
async function compress(input, output) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,framerate=15" -b:a 8k -crf 51 -preset ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function videoGif(input, output, options) {
    return ffmpeg(
        `-y -i ${path.join(
            __dirname,
            "..",
            input
        )} -vf "fps=24,scale=240:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -preset ${h264Preset} ${path.join(
            __dirname,
            "..",
            output
        )}`
    );
}
async function stitch(inputs, output) {
    return ffmpeg(
        `-y  -i ${path.join(__dirname, "..", inputs[0])} -i ${path.join(
            __dirname,
            "..",
            inputs[1]
        )} -filter_complex "[0][1]scale2ref=iw:ih[intro][main];[intro]drawbox=t=fill[intro-bg];[0][intro-bg]scale2ref=iw:ih:force_original_aspect_ratio=decrease:flags=spline[intro][intro-bg];[intro-bg][intro]overlay=x='(W-w)/2':y='(H-h)/2'[intro-resized]; [intro-resized][0:a][main][1:a]concat=n=2:v=1:a=1:unsafe=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -preset ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
    );
}
async function imageAudio(input, output) {
    return ffmpeg(
        `-y -loop 1 -i ${path.join(
            __dirname,
            "..",
            input + ".png"
        )} -i ${path.join(
            __dirname,
            "..",
            input + ".mp3"
        )} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -preset ${h264Preset} ${path.join(
            __dirname,
            "..",
            output + ".mp4"
        )}`
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
        )} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -shortest -preset ${h264Preset} ${path.join(
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
        }/2)*2,setsar=1:1[v1];[v0][v1]concat[vout]" -map "[vout]" -map "1:a" -vsync 2 -preset ${h264Preset} ${path.join(
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
        )} -r 15 -preset ${h264Preset} ${path.join(__dirname, "..", output)}`
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
        }" -map "[vout]" -map "[aout]" -vsync 2 -c:v libx264 -preset ${h264Preset} -t ${
            28 + options.videoLength - 1
        } ${path.join(__dirname, "..", output + ".mp4")}`
    );
}
async function videoAudio(input, output) {
    return ffmpeg(
        `-y -i ${path.join(__dirname, "..", input + ".mp4")} -i ${path.join(
            __dirname,
            "..",
            input + ".mp3"
        )} -map 0:v -map 1:a -c:v copy -shortest -preset ${h264Preset} ${path.join(
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
        }" -preset ${h264Preset} ${path.join(__dirname, "..", output)}`
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
};