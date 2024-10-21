import { ChannelType, EmbedBuilder, TextBasedChannel } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { sendWebhook } from "../lib/webhooks";
module.exports = {
    id: "star",
    name: "Star",
    desc: "Stars a message! Useful if you run out of pins in a channel...",
    showOnCommandSimulator: false,
    async execute(_, _1, msg) {
        if (!msg.reference) {
            return makeMessageResp("flaps", "reply to a message to star it!");
        }
        let ref = await msg.fetchReference();
        let guild = await ref.guild.fetch();
        let starChannel = guild.channels.cache.find(
            (c) => c.name == "flaps-stars"
        ) as TextBasedChannel;
        if (!starChannel) {
            starChannel = await guild.channels.create({
                name: "flaps-stars",
                type: ChannelType.GuildText,
            });
        }
        let embed = new EmbedBuilder();
        embed.setAuthor({
            name: ref.author.displayName,
            iconURL: ref.author.avatarURL(),
        });
        embed.setDescription(ref.content);
        embed.setTitle("⭐ Very Important Message ⭐");
        embed.setURL(ref.url);
        embed.setFooter({
            text: "Message pinned by " + msg.author.displayName,
            iconURL: msg.author.avatarURL(),
        });
        await sendWebhook(
            "flaps",
            "This message was so important people felt like they needed to keep it here forever.",
            starChannel,
            null,
            null,
            null,
            [embed]
        );
        return makeMessageResp("flaps", "Mhm.");
    },
} satisfies FlapsCommand;
