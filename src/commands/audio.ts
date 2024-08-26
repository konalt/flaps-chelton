import { FlapsCommand } from "../types";
import { voicePlayers } from "../index";
import { createAudioResource } from "@discordjs/voice";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "audio",
    name: "Audio",
    desc: "Plays an audio file from the audio directory in flaps.",
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        let reso = createAudioResource("audio/" + args[0] + ".mp3");
        voicePlayers.get(msg.guildId ?? "0")?.play(reso);
        return makeMessageResp("flaps", "now playing lmao");
    },
} satisfies FlapsCommand;
