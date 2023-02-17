import { Collection, GuildChannel } from "discord.js";
import { TextChannel } from "discord.js";
import { TextBasedChannel } from "discord.js";
import { PathLike, readFileSync } from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import { WebhookBot } from "../types";
import { readdir } from "fs/promises";
import { log } from "./logger";

const defaultContent = "No Content";
const defaultUsername = "No Username";
const defaultAvatar =
    "https://media.discordapp.net/attachments/838732607344214019/1075967910696210492/flapjpg.jpg";
const defaultTts = false;
function baseSend(
    url: string,
    content: string = defaultContent,
    username: string = defaultUsername,
    avatar_url: string = defaultAvatar,
    file: PathLike | null = null,
    tts: boolean = defaultTts
) {
    let form = new FormData();
    if (file !== null) {
        form.append("file0", new Blob([readFileSync(file)]), file.toString());
    }
    form.append(
        "payload_json",
        JSON.stringify({
            content,
            username,
            avatar_url,
            tts,
        })
    );
    fetch(url, {
        method: "POST",
        body: form as unknown as URLSearchParams,
    });
}

function getWebhookURL(channel: TextChannel): Promise<string> {
    return new Promise((resolve) => {
        channel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + channel.id
                );
                if (!hook) {
                    channel
                        .createWebhook({
                            name: "FlapsCheltonWebhook_" + channel.id,
                        })
                        .then((hook2) => {
                            resolve(hook2.url as string);
                        })
                        .catch(console.error);
                } else {
                    resolve(hook.url as string);
                }
            })
            .catch(console.error);
    });
}

export let hooks: Collection<string, WebhookBot> = new Collection();

export function updateUsers(): Promise<void> {
    return new Promise((res, rej) => {
        log("Loading webhook bots...", "start");
        readdir(__dirname + "/../hooks", {
            withFileTypes: true,
        }).then(async (files) => {
            let fileNames = files.map((file) => file.name.split(".")[0]);
            for (const file of fileNames) {
                let hook = require("../hooks/" + file) as WebhookBot;
                hooks.set(hook.id, hook);
            }
            res();
        });
    });
}

export function sendWebhook(id: string, content: string, channel: TextChannel) {
    getWebhookURL(channel).then((url: string) => {
        let user: WebhookBot = hooks.get(id);
        baseSend(
            url,
            content,
            user.name,
            user.avatar ||
                "https://konalt.us.to/flaps/avatars/" + user.id + ".png"
        );
    });
}
