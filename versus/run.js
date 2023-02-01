const cp = require("child_process");
const path = require("path");
const { stdout } = require("process");
const { download } = require("../flapslib");
const { sendWebhook } = require("../flapslib/webhooks");
const { log, esc, Color } = require("../flapslib/log");

var font = "fonts/font.ttf";

async function ffmpeg(args) {
    return new Promise((resolve) => {
        var ffmpegInstance = cp.spawn("ffmpeg", args.split(" "), {
            shell: true,
        });
        ffmpegInstance.stdout.on("data", (c) => {
            if (
                !c
                    .toString()
                    .match(
                        /(\[swscaler @ [0-9a-f]+\])+ deprecated pixel format used, make sure you did set range correctly/g
                    )
            )
                stdout.write(c);
        });
        ffmpegInstance.stderr.on("data", (c) => {
            if (
                !c
                    .toString()
                    .match(
                        /(\[swscaler @ [0-9a-f]+\])+ deprecated pixel format used, make sure you did set range correctly/g
                    )
            )
                stdout.write(c);
        });
        ffmpegInstance.on("exit", (code) => {
            resolve();
        });
    });
}

function looparg(name) {
    return name.endsWith(".mp4") || name.endsWith(".gif") ? "" : "-loop 1 ";
}

function createBothVideo(input, output, options) {
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

function createWinnerVideo(input, output) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(input[0])}-i ${
            input[0]
        } ${looparg(input[1])}-i ${
            input[1]
        } -t ${segmentLength} -i versus/black.png -filter_complex "[0:v]scale=400:390[img01_scaled];[1:v]scale=400:390[img02_scaled];[2:v]scale=400:800[bg_1s];[bg_1s][img01_scaled]overlay=0:0[bg_and_img01];[bg_and_img01][img02_scaled]overlay=0:410[vs_notext];[vs_notext]scale=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]drawtext=text='Winner':x=W/2-tw/2:y=H/2-th/2:fontsize=66:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function createTieVideo(input, output) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(input[0])}-i ${
            input[0]
        } ${looparg(input[1])}-i ${
            input[1]
        } -t ${segmentLength} -i versus/black.png -filter_complex "[0:v]scale=400:390[img01_scaled];[1:v]scale=400:390[img02_scaled];[2:v]scale=400:800[bg_1s];[bg_1s][img01_scaled]overlay=0:0[bg_and_img01];[bg_and_img01][img02_scaled]overlay=0:410[vs_notext];[vs_notext]scale=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]drawtext=text='Tie':x=W/2-tw/2:y=H/2-th/2:fontsize=66:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function createStatVideo(input, output, options) {
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

function createScoreVideo(input, output, options) {
    return ffmpeg(
        `${verbose ? "" : "-v warning "}-y ${looparg(
            input
        )}-t ${segmentLength} -i ${input} -filter_complex "[0:v]scale=-1:800,crop=400:800,setsar=1:1,setpts=PTS-STARTPTS[scaled];[scaled]drawtext=text='${
            options.curScore
        }':x=W/2-tw/2:y=H/2-th/2:fontsize=72:fontfile=${font}:borderw=5:bordercolor=black:fontcolor=white,fps=25[out]" -map "[out]" -t ${segmentLength} -r 25 ${output}.mp4`
    );
}

function addAudio(input, output, lobster, length) {
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

function concat(input, output) {
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

async function todo(client, msg) {
    if (msg.attachments.first(2)[1]) {
        var att = msg.attachments.first(2);
        download(
            att[0].url,
            path.join(
                __dirname,
                "img1." +
                    att[0].url.split(".")[att[0].url.split(".").length - 1]
            ),
            async () => {
                download(
                    att[1].url,
                    path.join(
                        __dirname,
                        "img2." +
                            att[1].url.split(".")[
                                att[1].url.split(".").length - 1
                            ]
                    ),
                    async () => {
                        var inputs = [
                            "versus/img1." +
                                att[0].url.split(".")[
                                    att[0].url.split(".").length - 1
                                ],
                            "versus/img2." +
                                att[1].url.split(".")[
                                    att[1].url.split(".").length - 1
                                ],
                        ];
                        var isLong = msg.content.startsWith("!vs2");
                        var segmentLengths = [70, 80];
                        if (isLong) {
                            segmentLengths = [70];
                        }
                        var audio = Math.floor(
                            Math.random() * segmentLengths.length
                        );
                        segmentLength = 60000 / segmentLengths[audio] / 1000;
                        if (isLong) audio = 2;
                        var names = msg.content
                            .split(" ")
                            .slice(1)
                            .join(" ")
                            .split(":");
                        var forceWin = names[2];
                        var vi = 0;

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
                                forceWin == 0 || forceWin == 1
                                    ? parseInt(forceWin)
                                    : Math.floor(Math.random() * 2);
                            scores[chosenSide]++;
                            await createScoreVideo(
                                inputs[chosenSide],
                                "versus/" + vi++,
                                {
                                    curScore: scores.join("-"),
                                }
                            );
                        }

                        await createWinnerVideo(
                            inputs,
                            "versus/" + vi++,
                            names
                        );

                        var winner = 0;
                        if (scores[1] > scores[0]) winner = 1;
                        if (scores[1] == scores[0]) winner = 2;
                        if (winner == 2) {
                            await createTieVideo(inputs, "versus/" + vi++);
                            var lobster = false;
                        } else {
                            if (Math.random() < 0.9) {
                                await createScoreVideo(
                                    inputs[winner],
                                    "versus/" + vi++,
                                    {
                                        curScore:
                                            winner == 2 ? "Tie" : names[winner],
                                    }
                                );
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
                            Array.from(Array(vi++).keys()).map(
                                (i) => "versus/" + i
                            ),
                            "versus/" + "out_noaudio"
                        );
                        await addAudio(
                            [
                                "versus/" + "out_noaudio",
                                "versus/" + "audio" + audio,
                            ],
                            "versus/" + "out",
                            lobster,
                            vi * segmentLength - segmentLength
                        );

                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [
                                    {
                                        attachment: "versus/out.mp4",
                                    },
                                ],
                            });

                        sendWebhook(
                            "flaps",
                            message.attachments.first().url,
                            false,
                            msg.channel
                        );
                    }
                );
            }
        );
    } else {
        sendWebhook("flaps", "i need 2 images and 2 names", msg.channel);
    }
}
module.exports = todo;
