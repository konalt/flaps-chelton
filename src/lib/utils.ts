import { Attachment, MessageComponent, TextBasedChannel } from "discord.js";
import { FlapsMessageCommandResponse } from "../types";
import { downloadPromise } from "./download";
import { get100Posts } from "./reddit";
import fs, { unlinkSync } from "fs";
import webpToPNG from "./ffmpeg/webpToPNG";
import { gzipSync, gunzipSync } from "node:zlib";

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
    return path.split(".")[path.split(".").length - 1].split("?")[0];
}

export const emojiRegex = /(?=\p{Emoji})(?=[\D])(?=[^\*#])/gu;
export const customEmojiRegex = /(<a?)?:\w+:(\d+>)/g;
export const flagEmojiRegex =
    /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]|\p{Emoji}[\uFE00-\uFE0F]/gu;

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
    image: ["image/png", "image/jpeg"],
    video: ["video/mp4", "video/x-matroska", "video/quicktime"],
    text: ["text/plain"],
    json: ["application/json"],
    gif: ["image/gif"],
    audio: ["audio/mpeg", "audio/aac", "audio/x-wav", "audio/ogg"],
    webp: ["image/webp"],
};

export function getTypeSingular(ct: string) {
    var type = "unknown+" + ct;
    Object.entries(types).forEach((a) => {
        if (a[1].includes(ct)) type = a[0];
    });
    return type;
}

export function getTypes(atts: Attachment[]) {
    return atts.map((att) => {
        var ct = att.contentType;
        var type = "unknown+" + ct;
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
    buffer: Buffer | null = null,
    filename: string | null = null,
    components: MessageComponent[] | null = null
): FlapsMessageCommandResponse {
    return {
        id,
        content,
        channel: null,
        buffer,
        filename,
        components,
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
    setTimeout(() => {
        unlinkSync(path);
    }, timeSeconds * 1000);
}

export function parseOptions(
    text: string,
    defaults: Record<string, any>
): [Record<string, any>, string] {
    let textArr = text.split(" ");
    let options = { ...defaults };
    let newText = [];
    for (const word of textArr) {
        if (!word.startsWith("--")) {
            newText.push(word);
            continue;
        }
        let [option, value] = word.substring(2).split("=");
        if (!value) value = "__boolset";
        if (Object.keys(options).includes(option)) {
            options[option] = value == "__boolset" ? true : value;
        }
    }
    return [options, newText.join(" ")];
}

export function convertWebpAttachmentToPng(attachment: Attachment) {
    return new Promise<Buffer>((resolve) => {
        downloadPromise(attachment.url).then(async (buf) => {
            let png = await webpToPNG([[buf, "webp"]]);
            resolve(png);
        });
    });
}

export function encodeObject(object: Object) {
    let encoded = gzipSync(
        Buffer.from(JSON.stringify(object), "ascii")
    ).toString("base64");
    return encoded;
}
export function decodeObject(string: string) {
    return JSON.parse(
        gunzipSync(Buffer.from(string, "base64")).toString("ascii")
    );
}

export const SPOILERBUG =
    "||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||";

export function hexToRGB(hex: string) {
    if (hex.startsWith("#")) hex = hex.slice(1);
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
}

export function calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return [srcWidth * ratio, srcHeight * ratio];
}

export function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(dp) + " " + units[u];
}

export async function exists(path: string) {
    try {
        await fs.promises.access(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export const PLACEHOLDER_IMAGE = dataURLToBuffer(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALUlEQVQ4T2O8w/DzvwoDOwOQZiCHZmRgYPhPrmaQPsZRF4yGwWg6AGfAgc8LADOwDrjWxfJ7AAAAAElFTkSuQmCC"
);

export async function tenorURLToGifURL(url: string): Promise<string> {
    let searchString = '<meta class="dynamic" name="twitter:image" content="';
    let response = await fetch(url).then((r) => r.text());
    let newURL = response
        .substring(response.indexOf(searchString) + searchString.length)
        .split('"')[0];
    return newURL;
}

export function getAngle(x: number, y: number, x2: number, y2: number) {
    let gameY = y2;
    let gameX = x2;
    let mouseY = y;
    let mouseX = x;
    let theta = 0;

    if (mouseX > gameX) {
        theta = Math.atan((gameY - mouseY) / (gameX - mouseX));
    } else if (mouseX < gameX) {
        theta = Math.PI + Math.atan((gameY - mouseY) / (gameX - mouseX));
    } else if (mouseX == gameX) {
        if (mouseY > gameY) {
            theta = Math.PI / 2;
        } else {
            theta = (Math.PI / 2) * 3;
        }
    }

    return theta;
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.hypot(x2 - x1, y2 - y1);
}
