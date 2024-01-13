import { Message, TextChannel } from "discord.js";
import { time } from "./utils";
import { commands } from "..";
import { hooks } from "./webhooks";

export enum Color {
    Reset = 0,
    Black = 30,
    Red = 31,
    Green = 32,
    Yellow = 33,
    Blue = 34,
    Magenta = 35,
    Cyan = 36,
    LightGrey = 37,
    DarkGrey = 90,
    BrightRed = 91,
    BrightGreen = 92,
    BrightYellow = 93,
    BrightBlue = 94,
    BrightMagenta = 95,
    BrightCyan = 96,
    White = 97,
}

export const esc = (n: number) => "\x1b[" + n.toString() + "m";

export const log = (text = "Text Here", sub: string | null = null) => {
    console.log(
        (sub
            ? `${esc(Color.White)}[${sub}] ${esc(
                  Color.DarkGrey
              )}[${time()}]${esc(Color.White)} `
            : `${esc(Color.White)}`) +
            text +
            esc(0)
    );
};

function idFromName(name: string) {
    return hooks.find((h) => h.name == name).id || "flaps";
}

export function getMessageLog(msg: Message) {
    if (!(msg.channel instanceof TextChannel)) return "";
    let commandChain: [string, string[]][] = msg.content
            .split("==>")
            .map((cmdtxt) => [
                cmdtxt.trim().split(" ")[0].substring(process.env.COMMAND_PREFIX.length),
                cmdtxt.trim().split(" ").slice(1)
            ]);
    let isCommand = !!commands.get(commandChain[0][0]);
    let isWebhook = msg.content.startsWith(process.env.WEBHOOK_PREFIX) && hooks.find(h => h.id == msg.content.split(" ")[0].substring(process.env.WEBHOOK_PREFIX.length));

    let mainContent = "";
    if (isCommand) {
        let i = 0;
        for (const [command, args] of commandChain) {
            i++;
            let tempMainContent = "";
            tempMainContent += esc(Color.BrightGreen);
            tempMainContent += process.env.COMMAND_PREFIX;
            tempMainContent += command;
            tempMainContent += esc(Color.LightGrey);
            tempMainContent += " ";
            tempMainContent += args.join(" ");
            mainContent += tempMainContent.trim();
            if (i != commandChain.length) {
                mainContent += esc(Color.Cyan);
                mainContent += " ==> ";
            }
        }
    } else if (isWebhook) {
        mainContent += esc(Color.BrightYellow);
        mainContent += msg.content.split(" ")[0];
        mainContent += " ";
        mainContent += esc(Color.LightGrey);
        mainContent += msg.content.split(" ").slice(1).join(" ");
    } else {
        mainContent += esc(Color.LightGrey);
        mainContent += msg.content;
    }

    if (msg.attachments.size > 0) {
        if (msg.content.length > 0) mainContent += " ";
        mainContent += esc(Color.BrightYellow);
        mainContent += `(${msg.attachments.size} attachment${msg.attachments.size > 1 ? "s" : ""})`;
    }

    let channel = `${esc(Color.Yellow)}<#${msg.channel.name}>`;

    let user = "";
    if (msg.author.bot && msg.author.discriminator == "0000") {
        user += `${esc(Color.Cyan)}`;
        user += `<${idFromName(msg.author.username)}>`;
    } else {
        user += `${esc(Color.BrightCyan)}`;
        user += `<${msg.author.username}>`;
    }

    return `${channel} ${user} ${mainContent}`.replace(/ {2,}/g," ");
}