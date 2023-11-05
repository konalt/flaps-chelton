import { textToSpeechSAM } from "../lib/tts";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
module.exports = {
    id: "tts",
    name: "Text to Speech",
    desc: "Makes a cool robot say something.",
    execute(args) {
        return new Promise((res, rej) => {
            let buffer = textToSpeechSAM(args.join(" "));
            res(
                makeMessageResp(
                    "flaps",
                    "",
                    null,
                    Buffer.from(buffer),
                    getFileName("TTS_SAM", "wav")
                )
            );
        });
    },
} satisfies FlapsCommand;
