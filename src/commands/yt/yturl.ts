import { voicePlayers } from "../../index";
import { makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { createAudioResource } from "@discordjs/voice";
import { getFirstResultID } from "../../lib/yt/search";
import { existsSync } from "fs";
import { spawn } from "child_process";

async function download(url: string, id: string) {
    return new Promise<void>((resolve, reject) => {
        var ytProcess = spawn(
            "yt-dlp",
            (
                url +
                " -f 140 -ciw --audio-quality 0 -x --audio-format mp3 -o ./audio/yt/" +
                id +
                ".mp3"
            ).split(" ")
        );
        var txt = "";
        ytProcess.stdout.on("data", (data) => (txt += data));
        ytProcess.stderr.on("data", (data) => (txt += data));
        ytProcess.on("close", (code) => {
            if (code == 1) {
                reject(txt);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    id: "yturl",
    name: "YouTube URL",
    desc: "Play a YouTube URL in voice chat.",
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        let url = args[0];
        if (url.startsWith("<")) url = url.substring(1);
        if (url.endsWith(">")) url = url.substring(0, url.length - 1);
        let player = voicePlayers.get(msg.guildId ?? "0");
        if (!player) {
            return makeMessageResp(
                "flaps",
                "i am NOT in the voice channel!\nyou gotta join first"
            );
        }
        var id = url.includes("newgrounds")
            ? url.split("/")[5]
            : url.includes("youtube.com/watch?v=")
            ? url.split("=")[1]
            : getFirstResultID(url);
        if (id === "kemivUKb4f4" || id === "NNv2RHR62Rs") {
            return makeMessageResp("flaps", "nuh uh uh!!!");
        }
        if (!url.startsWith("http")) {
            url = "https://youtube.com/watch?v=" + id;
        }

        if (existsSync("audio/yt/" + id + ".mp3")) {
            let reso = createAudioResource("audio/yt/" + id + ".mp3");
            player.play(reso);
            return makeMessageResp("flaps", "now playing lmao");
        }

        await download(url, id);
        let reso = createAudioResource("audio/yt/" + id + ".mp3");
        player.play(reso);
        return makeMessageResp("flaps", "now playing lmao");
    },
} satisfies FlapsCommand;
