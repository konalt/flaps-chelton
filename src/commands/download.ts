import { getFileName, makeMessageResp, uuidv4 } from "../lib/utils";
import { readFile, unlink } from "fs/promises";
import { spawn } from "child_process";
import { FlapsCommand } from "../types";
import audiovideo from "../lib/ffmpeg/audiovideo";

function getReddit(url: string, id: string, isVideo: boolean): Promise<string> {
    return new Promise((res, rej) => {
        let ext = isVideo ? "mp4" : "m4a";
        let fn = "./images/cache/Temp_RedditDL_" + id + "." + ext;
        let ytProcess = spawn(
            "yt-dlp",
            (url + " -f " + ext + " -o " + fn).split(" ")
        );
        let txt = "";
        ytProcess.stdout.on("data", (data) => (txt += data));
        ytProcess.stderr.on("data", (data) => (txt += data));
        ytProcess.on("close", (code) => {
            if (code != 0) {
                rej(txt);
            } else {
                res(fn);
            }
        });
    });
}

function download(url: string, id: string): Promise<string> {
    return new Promise((res, rej) => {
        let ext = "mp4";
        let fn = "./images/cache/Temp_UniDL_" + id + "." + ext;
        let ytProcess = spawn("yt-dlp", `${url} -f ${ext} -o ${fn}`.split(" "));
        let txt = "";
        ytProcess.stdout.on("data", (data) => (txt += data));
        ytProcess.stderr.on("data", (data) => (txt += data));
        ytProcess.on("close", (code) => {
            if (code != 0) {
                rej(txt);
            } else {
                res(fn);
            }
        });
    });
}

module.exports = {
    id: "download",
    name: "Download",
    aliases: ["dl", "unidl", "redditdl"],
    desc: "Downloads a video link.",
    async execute(args) {
        let url = args[0];
        if (url.startsWith("<")) url = url.substring(1);
        if (url.endsWith(">")) url = url.substring(0, url.length - 1);
        let id = uuidv4().toUpperCase().replace(/-/gi, "").substring(0, 8);
        if (url.includes("v.redd.it") || url.includes("reddit.com")) {
            let files = await Promise.all([
                getReddit(url, id, false),
                getReddit(url, id, true),
            ]);
            let audioPath = files[0];
            let videoPath = files[1];
            let audioContent = await readFile(audioPath);
            let videoContent = await readFile(videoPath);
            let combined = await audiovideo([
                [audioContent, audioPath],
                [videoContent, videoPath],
            ]);
            await Promise.all([unlink(audioPath), unlink(videoPath)]);
            return makeMessageResp(
                "reddit",
                "",
                combined,
                getFileName("DL_Reddit", "mp4")
            );
        } else {
            let filename = await download(url, id);
            let file = await readFile(filename);
            await unlink(filename);
            return makeMessageResp(
                "reddit",
                "",
                file,
                getFileName("DL_UniDL", "mp4")
            );
        }
    },
} satisfies FlapsCommand;
