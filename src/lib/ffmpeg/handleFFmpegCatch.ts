import { TextBasedChannel, TextChannel } from "discord.js";
import { FlapsCommandResponse } from "../../types";
import { makeMessageResp } from "../utils";
import { sendWebhook } from "../webhooks";

export default function handleFFmpegCatch(
    channel: TextBasedChannel,
    resolveFn: (resp: FlapsCommandResponse) => void
): (error: string) => void {
    return function handler(error: string) {
        resolveFn(makeMessageResp("ffmpeg", error, channel));
    };
}
