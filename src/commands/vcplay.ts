import {
    AudioPlayerState,
    AudioPlayerStatus,
    createAudioResource,
} from "@discordjs/voice";
import { getFileExt, getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { voicePlayers } from "..";
import { unlink, writeFile } from "fs/promises";

module.exports = {
    id: "vcplay",
    name: "VC Play",
    desc: "Plays a supplied audio file in voice chat.",
    needs: ["audio"],
    showOnCommandSimulator: false,
    async execute(args, buffers, msg) {
        let fn = `images/cache/${getFileName(
            "Temp_VCPlay",
            getFileExt(buffers[0][1])
        )}`;
        await writeFile(fn, buffers[0][0]);
        let res = createAudioResource(fn);
        let f = (oS: AudioPlayerState, nS: AudioPlayerState) => {
            if (nS.status == AudioPlayerStatus.Idle) {
                unlink(fn);
                voicePlayers
                    .get(msg.guildId ?? "0")
                    ?.removeListener("stateChange", f);
            }
        };
        voicePlayers.get(msg.guildId ?? "0")?.play(res);
        voicePlayers.get(msg.guildId ?? "0")?.on("stateChange", f);
        return makeMessageResp("flaps", "yuri");
    },
} satisfies FlapsCommand;
