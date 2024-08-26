import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageComponent,
} from "discord.js";
import { client } from "..";
import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { createGame, createMessageContent } from "../lib/tictactoe";

module.exports = {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    desc: "Starts a tic-tac-toe duel with another user.",
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        if (!args[0]) {
            return makeMessageResp(
                "tictactoe",
                "you gotta @ someone to duel with em!"
            );
        }
        function buttonRow(y: number): MessageComponent {
            let row = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ttt-${game.id}-0x${y}`)
                    .setLabel("_")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`ttt-${game.id}-1x${y}`)
                    .setLabel("_")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`ttt-${game.id}-2x${y}`)
                    .setLabel("_")
                    .setStyle(ButtonStyle.Secondary)
            );
            return row;
        }
        let uid = args[0].split("<@")[1].split(">")[0];
        let user = await client.users.fetch(uid);
        let game = createGame(msg.author, user);
        let components: MessageComponent[] = ([] = [
            buttonRow(0),
            buttonRow(1),
            buttonRow(2),
        ]);
        return makeMessageResp(
            "flaps",
            createMessageContent(game),
            null,
            null,
            components
        );
    },
} satisfies FlapsCommand;
