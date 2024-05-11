import { Message, TextChannel } from "discord.js";
import { time } from "./utils";
import { commands } from "..";
import { hooks } from "./webhooks";

const esc = (n: number) => "\x1b[" + n.toString() + "m";

export const Color = {
    Reset: esc(0),
    Black: esc(30),
    Red: esc(31),
    Green: esc(32),
    Yellow: esc(33),
    Blue: esc(34),
    Magenta: esc(35),
    Cyan: esc(36),
    LightGrey: esc(37),
    DarkGrey: esc(90),
    BrightRed: esc(91),
    BrightGreen: esc(92),
    BrightYellow: esc(93),
    BrightBlue: esc(94),
    BrightMagenta: esc(95),
    BrightCyan: esc(96),
    White: esc(97),
};

export const log = (text = "Text Here", sub: string | null = null) => {
    console.log(
        (sub
            ? `${Color.White}[${sub}] ${Color.DarkGrey}[${time()}]${
                  Color.White
              } `
            : `${Color.White}`) +
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
            tempMainContent += Color.BrightGreen;
            tempMainContent += process.env.COMMAND_PREFIX;
            tempMainContent += command;
            tempMainContent += Color.LightGrey;
            tempMainContent += " ";
            tempMainContent += args.join(" ");
            mainContent += tempMainContent.trim();
            if (i != commandChain.length) {
                mainContent += Color.Cyan;
                mainContent += " ==> ";
            }
        }
    } else if (isWebhook) {
        mainContent += Color.BrightYellow;
        mainContent += msg.content.split(" ")[0];
        mainContent += " ";
        mainContent += Color.LightGrey;
        mainContent += msg.content.split(" ").slice(1).join(" ");
    } else {
        mainContent += Color.LightGrey;
        mainContent += msg.content;
    }

    if (msg.attachments.size > 0) {
        if (msg.content.length > 0) mainContent += " ";
        mainContent += Color.BrightYellow;
        mainContent += `(${msg.attachments.size} attachment${
            msg.attachments.size > 1 ? "s" : ""
        })`;
    }

    let channel = `${Color.Yellow}<#${msg.channel.name}>`;

    let user = "";
    if (msg.author.bot && msg.author.discriminator == "0000") {
        user += `${Color.Cyan}`;
        user += `<${idFromName(msg.author.username)}>`;
    } else {
        user += `${Color.BrightCyan}`;
        user += `<${msg.author.username}>`;
    }

    return `${channel} ${user} ${mainContent}`.replace(/ {2,}/g, " ");
}
