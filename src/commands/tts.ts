import { textToSpeechSAM } from "../lib/tts";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "tts",
    name: "Text to Speech",
    desc: "Makes a cool robot say something.",
    async execute(args) {
        let buffer = textToSpeechSAM(args.join(" "));
        return makeMessageResp(
            "flaps",
            "",
            Buffer.from(buffer),
            getFileName("TTS_SAM", "wav")
        );
    },
} satisfies FlapsCommand;
