import { voicePlayers } from "../../index";
import { Message } from "discord.js";
import { makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import { createAudioResource } from "@discordjs/voice";
import { getFirstResultID } from "../../lib/yt/search";
import { existsSync } from "fs";
import { spawn } from "child_process";

module.exports = {
    id: "yturl",
    name: "YouTube URL",
    desc: "Play a YouTube URL in voice chat.",
    showOnCommandSimulator: false,
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            let url = args[0];
            if (url.startsWith("<")) url = url.substring(1);
            if (url.endsWith(">")) url = url.substring(0, url.length - 1);
            var id = url.includes("newgrounds")
                ? url.split("/")[5]
                : url.includes("youtube.com/watch?v=")
                ? url.split("=")[1]
                : getFirstResultID(url);
            if (id === "kemivUKb4f4" || id === "NNv2RHR62Rs") {
                return res(makeMessageResp("flaps", "nuh uh uh!!!"));
            }
            if (!url.startsWith("http")) {
                url = "https://youtube.com/watch?v=" + id;
            }

            if (existsSync("audio/yt/" + id + ".mp3")) {
                let reso = createAudioResource("audio/yt/" + id + ".mp3");
                voicePlayers.get(msg.guildId ?? "0")?.play(reso);
                res(makeMessageResp("flaps", "now playing lmao"));
            } else {
                var ytProcess = spawn(
                    "yt-dlp",
                    (
                        url +
                        " -x --audio-format mp3 -o ./audio/yt/" +
                        id +
                        ".mp3"
                    ).split(" ")
                );
                var txt = "";
                ytProcess.stdout.on("data", (data) => (txt += data));
                ytProcess.stderr.on("data", (data) => (txt += data));
                ytProcess.on("close", (code) => {
                    if (code == 1) {
                        res(
                            makeMessageResp(
                                "flaps",
                                "Error downloading youtube URL.\n" + txt
                            )
                        );
                    } else {
                        let reso = createAudioResource(
                            "audio/yt/" + id + ".mp3"
                        );
                        voicePlayers.get(msg.guildId ?? "0")?.play(reso);
                        res(makeMessageResp("flaps", "now playing lmao"));
                    }
                });
            }
        });
    },
} satisfies FlapsCommand;
