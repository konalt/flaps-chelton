import { textToSpeechSAM, textToSpeechSAMSing } from "../lib/tts";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand, TTSSAMLine } from "../types";
module.exports = {
    id: "singtts",
    name: "Sing Text to Speech",
    desc: "Makes a cool robot sing something!",
    execute(args) {
        return new Promise((res, rej) => {
            let lines: TTSSAMLine[] = [];
            for (const arg of args) {
                lines.push({
                    pitch: parseInt(arg.split(",")[1]),
                    text: arg.split(",")[0],
                    speed: 40,
                });
            }
            let buffer = textToSpeechSAMSing(lines);
            res(
                makeMessageResp(
                    "flaps",
                    "",
                    null,
                    Buffer.from(buffer),
                    getFileName("TTS_SAMSing", "wav")
                )
            );
        });
    },
} satisfies FlapsCommand;
