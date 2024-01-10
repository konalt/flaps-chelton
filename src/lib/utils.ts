import { Attachment, TextBasedChannel, TextChannel } from "discord.js";
import { FlapsMessageCommandResponse } from "../types";
import { downloadPromise } from "./download";
import { get100Posts } from "./reddit";
import { unlinkSync } from "fs";
import { Color, esc, log } from "./logger";

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

export const emojiRegex = /(?=\p{Emoji})(?=[\D])(?=[^\*#])/gu;
export const customEmojiRegex = /(<a?)?:\w+:(\d+>)/g;
export const flagEmojiRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g;

export function twemojiURL(emoji: string) {
    let cp1 = emoji.codePointAt(0).toString(16);
    let cp2: string;
    if (emoji.codePointAt(2)) {
        cp2 = emoji.codePointAt(2).toString(16);
    }
    let cp = cp1;
    if (cp2) cp += "-" + cp2;
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
    video: ["video/mp4", "video/x-matroska", "video/quicktime"],
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

// really shitty hack because theres no nameof() operator
export function getFunctionName(fn: Function) {
    return fn.toString().split(" ")[1].split("(")[0];
}

export function rgbtohex(rgb: { r: number; g: number; b: number }) {
    return (
        "#" +
        rgb.r.toString(16).padStart(2, "0") +
        rgb.g.toString(16).padStart(2, "0") +
        rgb.b.toString(16).padStart(2, "0")
    );
}

export function makeMessageResp(
    id: string,
    content: string,
    channel: TextBasedChannel | null = null,
    buffer: Buffer | null = null,
    filename: string | null = null
): FlapsMessageCommandResponse {
    return {
        id,
        content,
        channel,
        buffer,
        filename,
        type: 0,
    };
}

export function dataURLToBuffer(url: string) {
    return Buffer.from(url.split(",")[1], "base64");
}

export function bufferToDataURL(buffer: Buffer, type: string) {
    return "data:" + type + ";base64," + buffer.toString("base64");
}

export function scheduleDelete(path: string, timeSeconds: number) {
    log(
        `Scheduling deletion of file ${esc(Color.LightGrey)}${path}${esc(
            Color.White
        )} in ${esc(Color.Yellow)}${timeSeconds}${esc(Color.White)}s.`,
        "scheduledelete"
    );
    setTimeout(() => {
        log(
            `Deleting file ${esc(Color.LightGrey)}${path}${esc(Color.White)}.`,
            "scheduledelete"
        );
        unlinkSync(path);
    }, timeSeconds * 1000);
}
