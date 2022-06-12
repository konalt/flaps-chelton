const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const { stdout } = require("process");
const { uuidv4 } = require("./ai");

async function addText(input, output, options) {
    return new Promise((resolve, reject) => {
        //var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -filter_complex drawtext=fontfile="C\\:\\Windows\\fonts\\arial.ttf":x=${options.x}:y=${options.y}:text="Test":fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:fontsize=${options.fontsize},split[s0][s1];[s0]palettegen=reserve_transparent=1[p];[s1][p]paletteuse ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -filter_complex "drawtext=fontfile=arial.ttf:text='${options.text}':fontcolor=white:fontsize=${options.fontsize}:box=1:boxcolor=black@0.5:boxborderw=5:x=${options.x}:y=${options.y},split[s0][s1];[s0]palettegen=reserve_transparent=1[p];[s1][p]paletteuse" ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}

async function simpleMemeCaption(input, output, options) {
    return new Promise((resolve, reject) => {
        options.barSize = Math.round(options.barSize).toString()
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -vf "subtitles=f=subs.srt:force_style='Fontname=Impact,Fontsize=${options.fontSize},Alignment=6,MarginV=0',subtitles=f=subs_bottom.srt:force_style='Fontname=Impact,Fontsize=${options.fontSize},Alignment=2,MarginV=0'${output.endsWith(".gif") ? ",split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" : ""}" -q:v 3 ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function squash(input, output, options) {
    return new Promise((resolve, reject) => {
        // -vf "geq=r=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255):g=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255):b=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255),drawtext=fontfile=arial.ttf:text='${options.text}':fontcolor=black:fontsize=${options.fontSize}:x=(w-text_w)/2:y=(${options.barSize / 2}-text_h/2)"
        //crop=in_w:in_h-${options.barSize*2}:0:${options.barSize}
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -vf "scale=iw:ih*.5" ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function stretch(input, output, options) {
    return new Promise((resolve, reject) => {
        // -vf "geq=r=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255):g=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255):b=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255),drawtext=fontfile=arial.ttf:text='${options.text}':fontcolor=black:fontsize=${options.fontSize}:x=(w-text_w)/2:y=(${options.barSize / 2}-text_h/2)"
        //crop=in_w:in_h-${options.barSize*2}:0:${options.barSize}
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -vf "scale=iw*.5:ih" ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function setArmstrongSize(input, output, options) {
    return new Promise((resolve, reject) => {
        // -vf "geq=r=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255):g=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255):b=if(gt(Y\\,${options.barSize})\\,p(X\\,Y-${options.barSize})\\,255),drawtext=fontfile=arial.ttf:text='${options.text}':fontcolor=black:fontsize=${options.fontSize}:x=(w-text_w)/2:y=(${options.barSize / 2}-text_h/2)"
        //crop=in_w:in_h-${options.barSize*2}:0:${options.barSize}
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${input} -vf "scale=800:450,setsar=1:1,setpts=PTS-STARTPTS" ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function trim(input, output, options) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -ss ${options.start} -to ${options.end} ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function videoGif(input, output, options) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input)} -vf "fps=24,scale=240:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function stitch(inputs, output) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y  -i ${path.join(__dirname, "..", inputs[0])} -i ${path.join(__dirname, "..", inputs[1])} -filter_complex "[0]setdar=16/9[a];[1]setdar=16/9[b]; [a][b]concat=n=2:v=1:a=1" ${path.join(__dirname, "..", output + ".mp4")}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}

async function imageAudio(input, output) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -loop 1 -i ${path.join(__dirname, "..", input + ".png")} -i ${path.join(__dirname, "..", input + ".mp3")} -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest ${path.join(__dirname, "..", output + ".mp4")}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function baitSwitch(input, output, options = {}) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -t 1 -i ${path.join(__dirname, "..", input + ".png")} -i ${path.join(__dirname, "..", input + ".mp4")} -filter_complex "[0:v]scale=ceil(${options.w}/2)*2:ceil(${options.h}/2)*2,setsar=1:1[v0];[1:v]scale=ceil(${options.w}/2)*2:ceil(${options.h}/2)*2,setsar=1:1[v1];[v0][v1]concat[vout]" -map "[vout]" -map "1:a" -vsync 2 ${path.join(__dirname, "..", output + ".mp4")}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function mimeNod(output, bpm) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-framerate 1/${60 / bpm} -i ${path.join(__dirname, "..", "images", "nod%01d.png")} -r 15 ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function armstrongify(input, output, options) {
    return new Promise((resolve, reject) => {
                var ffmpegInstance = cp.spawn("ffmpeg", `-y ${options.isVideo?"":"-t 1 "}-i ${path.join(__dirname, "..", input)} -i ${path.join(__dirname, "..", "images", "armstrong_part1.mp4")} -i ${path.join(__dirname, "..", "images", "armstrong_part2.mp4")} -i ${path.join(__dirname, "..", "images", "armstrong_audio.mp3")} -filter_complex "[0:v]scale=800:450,setsar=1:1,setpts=PTS-STARTPTS,trim=duration=${options.videoLength - 1}[trimsidea];${options.isVideo?`[0:v]trim=${options.videoLength - 1}:${options.videoLength},scale=800:450,setsar=1:1,setpts=PTS-STARTPTS[trimsideb]`:`[0:v]scale=800:450,setsar=1:1[trimsideb]`};[2:v]scale=800:450,setsar=1:1,setpts=PTS-STARTPTS[nout];[1:v]scale=800:450,setsar=1:1,setpts=PTS-STARTPTS,colorkey=0x0000ff:0.05:0.05[ckout];[trimsideb][ckout]overlay[hout];[trimsidea][hout][nout]concat=n=3:a=0:v=1[vout];${options.isVideo ? `[0:a]atrim=0:${options.videoLength - 1}[atrima];[0:a]atrim=${options.videoLength - 1}:${options.videoLength}[atrimb];[3:a]atrim=0:1[atrimc];[3:a]atrim=1:28[atrimd];[atrimb][atrimc]amix=inputs=2:duration=1[atrime];[atrima][atrime][atrimd]concat=n=3:v=0:a=1[aout]` : "[3:a]anull[aout]"}" -map "[vout]" -map "[aout]" -vsync 2 -c:v libx264 -t ${28 + options.videoLength - 1} ${path.join(__dirname, "..", output + ".mp4")}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}
async function videoAudio(input, output) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y -i ${path.join(__dirname, "..", input + ".mp4")} -i ${path.join(__dirname, "..", input + ".mp3")} -map 0:v -map 1:a -c:v copy -shortest ${path.join(__dirname, "..", output + ".mp4")}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}

async function geq(input, output, options) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y ${input.startsWith("nullsrc") ? " -f lavfi -i nullsrc=s=256x256:d=5" : "-i " + path.join(__dirname, "..", input)} -vf "geq=r=${options.red}:g=${options.green}:b=${options.blue}" ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            resolve();
        });
    });
}

async function complexFFmpeg(input, output, options) {
    return new Promise((resolve, reject) => {
        var ffmpegInstance = cp.spawn("ffmpeg", `-y ${input.startsWith("nullsrc") ? " -f lavfi -i nullsrc=s=256x256:d=5" : "-i " + path.join(__dirname, "..", input)} ${options.args} ${path.join(__dirname, "..", output)}`.split(" "), { shell: true });
        ffmpegInstance.stdout.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            console.log("EXIT " + code);
            if (code == 1) {
                reject("Exit code 1!");
            } else {
                resolve();
            }
        });
    });
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
    mimeNod: mimeNod
}