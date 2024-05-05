import { ActionRowBuilder, MessageComponent } from "discord.js";
import { createBattle, getBattleImage, getComponents } from "../lib/battle";
import {
    SPOILERBUG,
    encodeObject,
    getFileName,
    makeMessageResp,
} from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "battle",
    name: "Battle",
    desc: "This command will never be finished :3",
    showOnCommandSimulator: false,
    async execute(_, _2, msg) {
        let battle = createBattle(msg.author);
        let components: MessageComponent[] = [
            new ActionRowBuilder().addComponents(getComponents(battle)),
        ];
        return makeMessageResp(
            "flaps",
            `The battle begins!${SPOILERBUG}\`${encodeObject(battle)}\``,
            null,
            await getBattleImage(battle),
            getFileName("Battle", "png"),
            components
        );
    },
} satisfies FlapsCommand;
