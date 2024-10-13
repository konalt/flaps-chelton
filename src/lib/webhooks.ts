import {
    Collection,
    DMChannel,
    GuildChannel,
    MessageComponent,
    NewsChannel,
    PartialDMChannel,
    PrivateThreadChannel,
    PublicThreadChannel,
    VoiceChannel,
} from "discord.js";
import { TextChannel } from "discord.js";
import { TextBasedChannel } from "discord.js";
import { PathLike, readFileSync } from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import { WebhookBot } from "../types";
import { readdir } from "fs/promises";
import { log } from "./logger";
import { users } from "./users";
import { writeFile } from "fs/promises";
import { file } from "./ffmpeg/ffmpeg";
import { DOMAIN } from "..";

const defaultContent = "No Content";
const defaultUsername = "No Username";
const defaultAvatar =
    "https://media.discordapp.net/attachments/838732607344214019/1075967910696210492/flapjpg.jpg";
const defaultTTS = false;
const defaultComponents = [];
const maxFileSizeMiB = 25;

async function baseEdit(
    url: string,
    content: string = defaultContent,
    username: string = defaultUsername,
    avatar_url: string = defaultAvatar,
    buf: Buffer | null = null,
    filename: string | null = null,
    components: MessageComponent[] = defaultComponents
) {
    let form = new FormData();
    let attachments = [];
    if (filename !== null) {
        form.append("files[0]", buf, filename);
        attachments = [
            {
                id: 0,
                filename: filename,
            },
        ];
    }
    form.append(
        "payload_json",
        JSON.stringify({
            content,
            username,
            avatar_url,
            components,
            attachments,
        })
    );
    await fetch(url, {
        method: "PATCH",
        body: form,
    });
    return true;
}

function baseSend(
    url: string,
    content: string = defaultContent,
    username: string = defaultUsername,
    avatar_url: string = defaultAvatar,
    buf: Buffer | null = null,
    filename: string | null = null,
    tts: boolean = defaultTTS,
    components: MessageComponent[] = defaultComponents
): Promise<string> {
    let form = new FormData();
    let attachments = [];
    if (filename !== null) {
        form.append("files[0]", buf, filename);
        attachments = [
            {
                id: 0,
                filename: filename,
            },
        ];
    } else if (content.length > 2000) {
        form.append("files[1]", Buffer.from(content), "message.txt");
        attachments = [
            {
                id: 1,
                filename: "message.txt",
            },
        ];
        content =
            "The message was too long. Content is in the file message.txt.";
    }

    form.append(
        "payload_json",
        JSON.stringify({
            content: content,
            username,
            avatar_url,
            tts,
            components,
            attachments,
        })
    );
    return new Promise<string>((resolve, reject) => {
        fetch(url, {
            method: "POST",
            body: form,
        })
            .then((r) => r.json())
            .then((r) => {
                resolve(r.id);
            });
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
        for (const user of users) {
            hooks.set(user.id, user);
        }
        res();
    });
}

export function editWebhookMessage(
    messageID: string,
    id: string,
    content: string,
    channel: TextBasedChannel,
    buffer: Buffer | null = null,
    filename: string | null = null,
    components: MessageComponent[] | null = null
) {
    return new Promise<void>((resolve, reject) => {
        getWebhookURL(channel as TextChannel).then(async (url: string) => {
            let user: WebhookBot = hooks.get(id);
            // if file is over 8mb, send failsafe
            if (
                buffer &&
                Buffer.byteLength(buffer) > maxFileSizeMiB * 1.049e6
            ) {
                await writeFile(file("cache/" + filename), buffer).then(() => {
                    content +=
                        "\nThis message originally contained a file, but the file was over " +
                        maxFileSizeMiB +
                        "MiB in size.\nLink: https://" +
                        DOMAIN +
                        "/cache/" +
                        filename +
                        "\n*This link will expire in 6 hours.*";
                });
                buffer = null;
                filename = null;
            }
            let name = user?.name || "wh:" + id;
            if (name == "flaps chelton") {
                let flapsMember = await (
                    channel as TextChannel
                ).guild.members.fetchMe();
                if (flapsMember.nickname) name = flapsMember.nickname;
            }
            baseEdit(
                url + "/messages/" + messageID,
                user?.quirk ? user?.quirk(content) : content,
                name,
                user?.avatar || "https://" + DOMAIN + "/avatar/" + id + ".webp",
                buffer,
                filename,
                components
            ).then(() => {
                resolve();
            });
        });
    });
}

export async function sendWebhook(
    id: string,
    content: string,
    channel: TextBasedChannel,
    buffer: Buffer | null = null,
    filename: string | null = null,
    components: MessageComponent[] | null = null
): Promise<string> {
    const url = await getWebhookURL(channel as TextChannel);
    let user: WebhookBot = hooks.get(id);
    // if file is over 8mb, send failsafe
    if (buffer && Buffer.byteLength(buffer) > maxFileSizeMiB * 1049000) {
        await writeFile(file("cache/" + filename), buffer).then(() => {
            content +=
                "\nThis message originally contained a file, but the file was over " +
                maxFileSizeMiB +
                "MiB in size.\nLink: https://" +
                DOMAIN +
                "/cache/" +
                filename +
                "\n*This link will expire in 6 hours.*";
        });
        buffer = null;
        filename = null;
    }
    let name = user?.name || "wh:" + id;
    if (name == "flaps chelton") {
        let flapsMember = await (
            channel as TextChannel
        ).guild.members.fetchMe();
        if (flapsMember.nickname) name = flapsMember.nickname;
    }
    let msgid = await baseSend(
        url + "?wait=true",
        user?.quirk ? user?.quirk(content) : content,
        name,
        user?.avatar || "https://" + DOMAIN + "/avatar/" + id + ".webp",
        buffer,
        filename,
        false,
        components
    );
    return msgid;
}
