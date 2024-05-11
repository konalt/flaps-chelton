import { Message, TextChannel } from "discord.js";
import { time } from "./utils";
import { VERBOSE, commands } from "..";
import { hooks } from "./webhooks";

const esc = (n: number) => "\x1b[" + n.toString() + "m";

export const C = {
    Reset: esc(0),
    Black: esc(30),
    Red: esc(31),
    Green: esc(32),
    Yellow: esc(33),
    Blue: esc(34),
    Magenta: esc(35),
    Cyan: esc(36),
    LGrey: esc(37),
    DGrey: esc(90),
    BRed: esc(91),
    BGreen: esc(92),
    BYellow: esc(93),
    BBlue: esc(94),
    BMagenta: esc(95),
    BCyan: esc(96),
    White: esc(97),
};

export enum LogMode {
    NotVerbose,
    Verbose,
    Always,
}

export const log = (
    text = "Text Here",
    sub: string | null = null,
    logtype: LogMode = LogMode.Always
) => {
    if (logtype == LogMode.Verbose && !VERBOSE) return;
    if (logtype == LogMode.NotVerbose && VERBOSE) return;
    console.log(
        (sub
            ? `${C.White}[${sub}] ${C.DGrey}[${time()}]${C.White} `
            : `${C.White}`) +
            text +
            esc(0)
    );
};

function idFromName(name: string) {
    return hooks.find((h) => h.name == name)?.id || "flaps";
}

export function getMessageLog(msg: Message) {
    if (!(msg.channel instanceof TextChannel)) return "";
    let commandChain: [string, string[]][] = msg.content
        .split("==>")
        .map((cmdtxt) => [
            cmdtxt
                .trim()
                .split(" ")[0]
                .substring(process.env.COMMAND_PREFIX.length),
            cmdtxt.trim().split(" ").slice(1),
        ]);
    let isCommand = !!commands.find((cmd) =>
        cmd.aliases.includes(commandChain[0][0].toLowerCase())
    );
    let isWebhook =
        msg.content.startsWith(process.env.WEBHOOK_PREFIX) &&
        hooks.find(
            (h) =>
                h.id ==
                msg.content
                    .split(" ")[0]
                    .substring(process.env.WEBHOOK_PREFIX.length)
        );

    let mainContent = "";
    if (isCommand) {
        let i = 0;
        for (const [command, args] of commandChain) {
            i++;
            let tempMainContent = "";
            tempMainContent += C.BGreen;
            tempMainContent += process.env.COMMAND_PREFIX;
            tempMainContent += command;
            tempMainContent += C.LGrey;
            tempMainContent += " ";
            tempMainContent += args.join(" ");
            mainContent += tempMainContent.trim();
            if (i != commandChain.length) {
                mainContent += C.Cyan;
                mainContent += " ==> ";
            }
        }
    } else if (isWebhook) {
        mainContent += C.BYellow;
        mainContent += msg.content.split(" ")[0];
        mainContent += " ";
        mainContent += C.LGrey;
        mainContent += msg.content.split(" ").slice(1).join(" ");
    } else {
        mainContent += C.LGrey;
        mainContent += msg.content;
    }

    if (msg.attachments.size > 0) {
        if (msg.content.length > 0) mainContent += " ";
        mainContent += C.BYellow;
        mainContent += `(${msg.attachments.size} attachment${
            msg.attachments.size > 1 ? "s" : ""
        })`;
    }

    let channel = `${C.Yellow}<#${msg.channel.name}>`;

    let user = "";
    if (msg.author.bot && msg.author.discriminator == "0000") {
        user += `${C.Cyan}`;
        user += `<${idFromName(msg.author.username)}>`;
    } else {
        user += `${C.BCyan}`;
        user += `<${msg.author.username}>`;
    }

    return `${channel} ${user} ${mainContent}`.replace(/ {2,}/g, " ");
}
