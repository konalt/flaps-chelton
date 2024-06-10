import fetch from "node-fetch";
import { dataURLToBuffer, getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "tiktoktts",
    name: "TikTok TTS",
    desc: "Uses that one annoying TikTok TTS voice.",
    async execute(args) {
        let response = await fetch("https://countik.com/api/text/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: args.join(" "),
                voice: "en_us_001",
            }),
        }).then((r) => r.json());
        let buffer = dataURLToBuffer(`,${response.v_data}`);
        return makeMessageResp(
            "flaps",
            "le text",
            null,
            buffer,
            getFileName("TTS_TikTok", "wav")
        );
    },
} satisfies FlapsCommand;
