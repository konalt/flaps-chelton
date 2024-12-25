import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import vocode from "../../lib/nyquist/vocode";
import { getFileName, getTypeSingular, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "vocode",
    name: "Vocode",
    desc: "Vocodes an audio file to another. Takes a modulation file and a carrier file.",
    needs: ["video/audio", "audio?"],
    async execute(args, buf) {
        if (buf[0][1] == "mp4") {
            let result = await vocode(buf[0], buf[1]);
            let combined = await ffmpegBuffer(
                `-i $BUF0 -i $BUF1 -map "0:v:0" -map "1:a:0" -af volume=1.5 -shortest $PRESET $OUT`,
                [buf[0], [result, "mp3"]],
                "mp4"
            );
            return makeMessageResp(
                "ffmpeg",
                "",
                combined,
                getFileName("Nyquist_Vocode", "mp4")
            );
        } else {
            let result = await vocode(buf[0], buf[1]);
            return makeMessageResp(
                "ffmpeg",
                "",
                result,
                getFileName("Nyquist_Vocode", "mp3")
            );
        }
    },
} satisfies FlapsCommand;
