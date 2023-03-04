import { TextBasedChannel, TextChannel } from "discord.js";
import { FlapsCommandResponse } from "../../types";
import { getFileName, makeMessageResp } from "../utils";
import { sendWebhook } from "../webhooks";

export default function handleFFmpeg(
    filename: string,
    channel: TextBasedChannel,
    resolveFn: (resp: FlapsCommandResponse) => void
): (buffer: Buffer) => void {
    return function handler(buffer: Buffer) {
        resolveFn(makeMessageResp("ffmpeg", "", channel, buffer, filename));
    };
}
