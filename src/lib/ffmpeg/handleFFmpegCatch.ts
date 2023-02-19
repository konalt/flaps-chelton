import { TextBasedChannel, TextChannel } from "discord.js";
import { sendWebhook } from "../webhooks";

export default function handleFFmpeg(
    channel: TextBasedChannel
): (error: string) => void {
    return function handler(error: string) {
        sendWebhook("ffmpeg", error, channel);
    };
}
