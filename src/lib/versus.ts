import { Client, Message } from "discord.js";
import { ffmpeg, file } from "./ffmpeg/ffmpeg";
import { sendWebhook } from "./webhooks";
import { download } from "./download";
import { join } from "path";
import { getFileExt, getFileName, makeMessageResp } from "./utils";
import { readFile, writeFile } from "fs/promises";

function looparg(name: string) {
    return name.endsWith(".mp4") || name.endsWith(".gif") ? "" : "-loop 1 ";
}

const font = "fonts/font.ttf";

function createBothVideo(input: string[], output: string, options: string[]) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(input[0])}-i ${
            input[0]
        } ${looparg(input[1])}-i ${
            input[1]
        } -t ${segmentLength} -i versus/black.png -filter_complex "[0:v]scale=400:390[img01_scaled];[1:v]scale=400:390[img02_scaled];[2:v]scale=400:800[bg_1s];[bg_1s][img01_scaled]overlay=0:0[bg_and_img01];[bg_and_img01][img02_scaled]overlay=0:410[vs_notext];[vs_notext]scale=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]split=1[scaled1];[scaled1]drawtext=text='${
            options[0]
        }':x=W/2-tw/2:y=H/3-th/2:fontsize=36:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,drawtext=text='VS':x=W/2-tw/2:y=H/2-th/2:fontsize=66:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,drawtext=text='${
            options[1]
        }':x=W/2-tw/2:y=H/3*2-th/2:fontsize=36:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function createWinnerVideo(input: string[], output: string) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(input[0])}-i ${
            input[0]
        } ${looparg(input[1])}-i ${
            input[1]
        } -t ${segmentLength} -i versus/black.png -filter_complex "[0:v]scale=400:390[img01_scaled];[1:v]scale=400:390[img02_scaled];[2:v]scale=400:800[bg_1s];[bg_1s][img01_scaled]overlay=0:0[bg_and_img01];[bg_and_img01][img02_scaled]overlay=0:410[vs_notext];[vs_notext]scale=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]drawtext=text='Winner':x=W/2-tw/2:y=H/2-th/2:fontsize=66:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function createTieVideo(input: string[], output: string) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(input[0])}-i ${
            input[0]
        } ${looparg(input[1])}-i ${
            input[1]
        } -t ${segmentLength} -i versus/black.png -filter_complex "[0:v]scale=400:390[img01_scaled];[1:v]scale=400:390[img02_scaled];[2:v]scale=400:800[bg_1s];[bg_1s][img01_scaled]overlay=0:0[bg_and_img01];[bg_and_img01][img02_scaled]overlay=0:410[vs_notext];[vs_notext]scale=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]drawtext=text='Tie':x=W/2-tw/2:y=H/2-th/2:fontsize=66:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function createStatVideo(
    input: string[],
    output: string,
    options: { stat: string }
) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(input[0])}-i ${
            input[0]
        } ${looparg(input[1])}-i ${
            input[1]
        } -t ${segmentLength} -i versus/black.png -filter_complex "[0:v]scale=400:390[img01_scaled];[1:v]scale=400:390[img02_scaled];[2:v]scale=400:800[bg_1s];[bg_1s][img01_scaled]overlay=0:0[bg_and_img01];[bg_and_img01][img02_scaled]overlay=0:410[vs_notext];[vs_notext]scale=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]split=1[scaled1];[scaled1]drawtext=text='${
            options.stat
        }':x=W/2-tw/2:y=H/2-th/2:fontsize=72:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function createScoreVideo(
    input: string,
    output: string,
    options: { curScore: string }
) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(
            input
        )}-t ${segmentLength} -i ${input} -filter_complex "[0:v]scale=-1:800,crop=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]drawtext=text='${
            options.curScore
        }':x=W/2-tw/2:y=H/2-th/2:fontsize=72:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function addAudio(
    input: string[],
    output: string,
    lobster: boolean,
    length: number
) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y -i ${input[0]}.mp4 -i ${
            input[1]
        }.mp3 -i versus/drac.mp3 -filter_complex "[1:a]atrim=0:${
            lobster ? length - segmentLength : length
        }${
            lobster ? "[tmp];[tmp][2:a]concat=n=2:v=0:a=1[aout]" : "[aout]"
        };[0:v]scale=400:800[vout]" -map "[aout]" -map "[vout]" -r 25 ${output}.mp4`
    );
}

function concat(input: string[], output: string) {
    var intext = "-i " + input.join(".mp4 -i ") + ".mp4";
    var intext2 = Array.from(
        { length: input.length },
        (_, i) => "[" + i.toString() + ":v]"
    ).join("");
    return ffmpeg(
        `${
            verbose ? "" : "-v warning "
        }-y ${intext} -filter_complex "${intext2}concat=n=${
            input.length
        }:v=1:a=0[out]" -map "[out]" -t ${
            input.length * segmentLength
        } -r 25 ${output}.mp4`
    );
}
var segmentLength = 60000 / 70 / 1000;
var verbose = true;

async function versus(
    buffers: [Buffer, string][],
    names: string[],
    isLong: boolean
): Promise<Buffer> {
    return new Promise(async (res, rej) => {
        if (buffers[1]) {
            var segmentLengths = [70, 80];
            if (isLong) {
                segmentLengths = [70];
            }
            var audio = Math.floor(Math.random() * segmentLengths.length);
            segmentLength = 60000 / segmentLengths[audio] / 1000;
            if (isLong) audio = 2;
            var forceWin = names[2];
            var vi = 0;

            await writeFile(
                "versus/img1." + getFileExt(buffers[0][1]),
                buffers[0][0]
            );
            await writeFile(
                "versus/img2." + getFileExt(buffers[1][1]),
                buffers[1][0]
            );

            var inputs = [
                "versus/img1." + getFileExt(buffers[0][1]),
                "versus/img2." + getFileExt(buffers[1][1]),
            ];

            await createBothVideo(inputs, "versus/" + vi++, names);

            var stats = [
                "Speed",
                "Agility",
                "Strength",
                "Size",
                "Weaponry",
                "Diplomacy",
                "Comedy",
            ];
            if (isLong) {
                stats = [
                    "Speed",
                    "Agility",
                    "Strength",
                    "Size",
                    "Weaponry",
                    "Diplomacy",
                    "Comedy",
                    "Warfare",
                    "Power",
                    "Straight",
                    "Disgust",
                    "Buffness",
                    "Royal",
                    "Cute",
                    "Has Simps",
                    "Scary",
                    "Willpower",
                    "Gamer",
                    "Bitches",
                    "Streetsmart",
                    "Booksmart",
                    "Meth Cook",
                    "Legal",
                    "Lawyer",
                    "Hot",
                    "Nose Size",
                    "Annoying",
                    "Shitty",
                    "Age",
                    "Width",
                    "Height",
                    "Intel",
                    "Race",
                    "Politics",
                    "Hand Size",
                    "Funo Hate",
                    "Landlubber",
                    "Coolness",
                    "Depth",
                    "Health",
                    "Chadness",
                    "Non-brit",
                    "Music",
                    "Education",
                    "Heists",
                    "TF2 Level",
                    "Based",
                    "Cringe",
                    "Smart",
                ];
            }
            var scores = [0, 0];
            for (let i = 0; i < stats.length; i++) {
                const stat = stats[i];
                await createStatVideo(inputs, "versus/" + vi++, {
                    stat: stat,
                });
                var chosenSide =
                    forceWin == "0" || forceWin == "1"
                        ? parseInt(forceWin)
                        : Math.floor(Math.random() * 2);
                scores[chosenSide]++;
                await createScoreVideo(inputs[chosenSide], "versus/" + vi++, {
                    curScore: scores.join("-"),
                });
            }

            await createWinnerVideo(inputs, "versus/" + vi++);

            var winner = 0;
            if (scores[1] > scores[0]) winner = 1;
            if (scores[1] == scores[0]) winner = 2;
            var lobster = false;
            if (winner == 2) {
                await createTieVideo(inputs, "versus/" + vi++);
                lobster = false;
            } else {
                if (Math.random() < 0.9) {
                    await createScoreVideo(inputs[winner], "versus/" + vi++, {
                        curScore: winner == 2 ? "Tie" : names[winner],
                    });
                } else {
                    lobster = true;
                    await createScoreVideo(
                        "versus/lober.png",
                        "versus/" + vi++,
                        {
                            curScore: "lober",
                        }
                    );
                }
            }

            await concat(
                Array.from(Array(vi++).keys()).map((i) => "versus/" + i),
                "versus/" + "out_noaudio"
            );
            await addAudio(
                ["versus/" + "out_noaudio", "versus/" + "audio" + audio],
                "versus/" + "out",
                lobster,
                vi * segmentLength - segmentLength
            );

            res(await readFile("versus/out.mp4"));
        } else {
            rej("2 Images and Names are needed");
        }
    });
}

export default versus;
