import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import { users } from "../lib/users";
import { hooks } from "../lib/webhooks";
import {
    client,
    voiceConnections,
    voicePlayers,
    addBuffer,
    addBufferSequence,
    commands,
} from "../index";
import fs from "fs/promises";
import * as utils from "../lib/utils";

const proxy = {
    users,
    hooks,
    fs,
    sendWebhook,
    client,
    voiceConnections,
    voicePlayers,
    addBuffer,
    addBufferSequence,
    commands,
    utils,
};

module.exports = {
    id: "eval",
    name: "Eval",
    desc: "Evaluates some JavaScript code.",
    showOnCommandSimulator: false,
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            if (msg.author.id !== process.env.OWNER_TOKEN) {
                res(makeMessageResp("flaps", "nuh uh uh!"));
                return;
            }
            var evaluated = eval(args.join(" "));
            if (evaluated) {
                res(
                    makeMessageResp(
                        "flaps",
                        evaluated.toString
                            ? evaluated.toString()
                            : "No response",
                        msg.channel
                    )
                );
            } else {
                res(makeMessageResp("flaps", "No response", msg.channel));
            }
        });
    },
} satisfies FlapsCommand;
