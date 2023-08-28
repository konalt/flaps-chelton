import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "react",
    name: "React",
    desc: "Reacts to the replied message with a specified emoji.",
    showOnCommandSimulator: false,
    async execute(args, buf, msg) {
        return new Promise(async (res) => {
            var ref = await msg.fetchReference();
            var emoji = args[0];

            if (!emoji) {
                return res(makeMessageResp("flaps", "gimme an emoji!"));
            }
            if (!ref) {
                return res(
                    makeMessageResp("flaps", "reply to smt first silly man!")
                );
            }

            ref.react(emoji);

            res(makeMessageResp("", ""));
        });
    },
} satisfies FlapsCommand;
