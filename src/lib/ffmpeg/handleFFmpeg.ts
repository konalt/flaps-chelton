import { TextBasedChannel, TextChannel } from "discord.js";
import { FlapsCommandResponse } from "../../types";
import { getFileName, makeMessageResp } from "../utils";
import { sendWebhook } from "../webhooks";

export default function handleFFmpeg(
    filename: string,
    resolveFn: (resp: FlapsCommandResponse) => void
): (buffer: Buffer) => void {
    return function handler(buffer: Buffer) {
        resolveFn(makeMessageResp("ffmpeg", "", null, buffer, filename));
    };
}
