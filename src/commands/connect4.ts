import { client } from "..";
import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import {
    createComponentList,
    createGame,
    createImage,
    createMessageContent,
} from "../lib/connect4";

module.exports = {
    id: "connect4",
    name: "Connect 4",
    desc: "Plays Connect 4 with another player!",
    aliases: ["connectfour", "c4"],
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        if (!args[0]) {
            return makeMessageResp(
                "tictactoe",
                "you gotta @ someone to duel with em!"
            );
        }
        let uid = args[0].split("<@")[1].split(">")[0];
        let user = await client.users.fetch(uid);
        let game = createGame(msg.author, user);
        return makeMessageResp(
            "flaps",
            createMessageContent(game),
            await createImage(game),
            `${game.id}.png`,
            createComponentList(game)
        );
    },
} satisfies FlapsCommand;
