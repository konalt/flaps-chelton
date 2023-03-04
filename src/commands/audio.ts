import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import { voicePlayers } from "../index";
import { createAudioResource } from "@discordjs/voice";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "audio",
    name: "Audio",
    desc: "Plays an audio file from the audio directory in flaps.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            let reso = createAudioResource("audio/" + args[0] + ".mp3");
            voicePlayers.get(msg.guildId ?? "0")?.play(reso);
            res(makeMessageResp("flaps", "now playing lmao", msg.channel));
        });
    },
} satisfies FlapsCommand;
