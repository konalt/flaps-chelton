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
    getAllUserStates,
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
    getAllUserStates,
};

module.exports = {
    id: "eval",
    name: "Eval",
    desc: "Evaluates some JavaScript code.",
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        if (msg.author.id !== process.env.OWNER_TOKEN) {
            return makeMessageResp("flaps", "nuh uh uh!");
        }
        var evaluated = eval(args.join(" "));
        if (evaluated) {
            return makeMessageResp(
                "flaps",
                evaluated.toString ? evaluated.toString() : "No response"
            );
        } else {
            return makeMessageResp("flaps", "No response");
        }
    },
} satisfies FlapsCommand;
