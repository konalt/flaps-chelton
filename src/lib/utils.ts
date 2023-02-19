import { Attachment, TextChannel } from "discord.js";
import { downloadPromise } from "./download";
import { get100Posts } from "./reddit";
import { sendWebhook } from "./webhooks";

export function uuidv4() {
    let s = (n = 1) =>
        n == 1
            ? Math.floor(Math.random() * 65535)
                  .toString(16)
                  .padStart(4, "0")
            : Math.floor(Math.random() * 65535)
                  .toString(16)
                  .padStart(4, "0") + s(n - 1);
    return [s(2), s(), s(), s(), s(3)].join("-");
}

export function sample(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getFileName(type: string, ext: string = "helo"): string {
    return (
        type +
        "_" +
        uuidv4().toUpperCase().replace(/-/gi, "").substring(0, 8) +
        "." +
        ext
    );
}

export function randomRedditImage(subreddit: string): Promise<Buffer> {
    return new Promise((res, rej) => {
        get100Posts(subreddit).then((posts) => {
            posts = posts
                .filter((p) => {
                    return (
                        p.data.post_hint == "image" &&
                        p.data.url_overridden_by_dest
                    );
                })
                .map((p) => {
                    return p.data.url_overridden_by_dest;
                });
            let post = sample(posts);
            downloadPromise(post).then((buf) => {
                if (buf == null) return;
                res(buf);
            });
        });
    });
}

export function getFileExt(path: string) {
    return path.split(".")[path.split(".").length - 1];
}

export function twemojiURL(emoji: string) {
    var cp = emoji.codePointAt(0).toString(16);
    return (
        "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/" +
        cp +
        ".png"
    );
}

export function time() {
    var d = new Date();
    var h = d.getHours().toString().padStart(2, "0");
    var m = d.getMinutes().toString().padStart(2, "0");
    var s = d.getSeconds().toString().padStart(2, "0");
    return [h, m, s].join(":");
}

export const types = {
    image: ["image/png", "image/jpeg", "image/webp"],
    video: ["video/mp4", "video/x-matroska"],
    text: ["text/plain"],
    json: ["application/json"],
    gif: ["image/gif"],
    audio: ["audio/mpeg", "audio/aac"],
};

export function getTypeSingular(ct: string) {
    var type = "unknown";
    Object.entries(types).forEach((a) => {
        if (a[1].includes(ct)) type = a[0];
    });
    return type;
}

export function getTypes(atts: Attachment[]) {
    return atts.map((att) => {
        var ct = att.contentType;
        var type = "unknown";
        Object.entries(types).forEach((a) => {
            if (a[1].includes(ct)) type = a[0];
        });
        return type;
    });
}

export function getFunctionName(fn: Function) {
    return fn.toString().split(" ")[1].split("(")[0];
}
