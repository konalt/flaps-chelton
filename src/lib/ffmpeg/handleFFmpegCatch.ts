import { TextBasedChannel, TextChannel } from "discord.js";
import { FlapsCommandResponse } from "../../types";
import { makeMessageResp } from "../utils";
import { sendWebhook } from "../webhooks";

export default function handleFFmpegCatch(
    resolveFn: (resp: FlapsCommandResponse) => void
): (error: string) => void {
    return function handler(error: string) {
        console.log("FUCK" + error);

        resolveFn(
            makeMessageResp(
                "ffmpeg",
                `FFmpeg exited with status code != 0.\nUseful log stuff:\n\`\`\`${error}\`\`\``
            )
        );
    };
}
