import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

const responses = [
    // Yes
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes - definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    // Maybe
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    // No
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful",
];

module.exports = {
    id: "ynquestion",
    name: "Magic 8 Ball",
    desc: "Asks the magic 8 ball a question.",
    aliases: ["8ball", "magic8ball", "9ball", "magic9ball"],
    async execute() {
        let resp = responses[Math.floor(Math.random() * responses.length)];
        return makeMessageResp("magic8ball", resp);
    },
} satisfies FlapsCommand;
