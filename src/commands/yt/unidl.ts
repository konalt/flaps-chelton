import { getFileName, makeMessageResp, uuidv4 } from "../../lib/utils";
import { readFile, unlink } from "fs/promises";
import { spawn } from "child_process";
import { FlapsCommand } from "../../types";
import audiovideo from "../../lib/ffmpeg/audiovideo";

function download(url: string, id: string): Promise<string> {
    return new Promise((res, rej) => {
        let ext = "mp4";
        let fn = "./images/cache/Temp_UniDL_" + id + "." + ext;
        var ytProcess = spawn("yt-dlp", `${url} -f ${ext} -o ${fn}`.split(" "));
        var txt = "";
        ytProcess.stdout.on("data", (data) => (txt += data));
        ytProcess.stderr.on("data", (data) => (txt += data));
        ytProcess.on("close", async (code) => {
            if (code != 0) {
                rej(txt);
            } else {
                res(fn);
            }
        });
    });
}

module.exports = {
    id: "unidl",
    name: "UniDL",
    desc: "Downloads PRETTY MUCH EVERYTHING HAHAHAHAHA",
    execute(args: string[]) {
        return new Promise((res, rej) => {
            let url = args[0];
            if (url.startsWith("<")) url = url.substring(1);
            if (url.endsWith(">")) url = url.substring(0, url.length - 1);
            let id = uuidv4().toUpperCase().replace(/-/gi, "").substring(0, 8);
            download(url, id).then(async (fn) => {
                res(
                    makeMessageResp(
                        "reddit",
                        "",
                        null,
                        await readFile(fn),
                        getFileName("DL_UniDL", "mp4")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
