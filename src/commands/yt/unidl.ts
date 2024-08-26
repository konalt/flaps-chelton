import { getFileName, makeMessageResp, uuidv4 } from "../../lib/utils";
import { readFile, unlink } from "fs/promises";
import { spawn } from "child_process";
import { FlapsCommand } from "../../types";

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
    async execute(args) {
        let url = args[0];
        if (url.startsWith("<")) url = url.substring(1);
        if (url.endsWith(">")) url = url.substring(0, url.length - 1);
        let id = uuidv4().toUpperCase().replace(/-/gi, "").substring(0, 8);
        let filename = await download(url, id);
        let file = await readFile(filename);
        await unlink(filename);
        return makeMessageResp(
            "reddit",
            "",
            file,
            getFileName("DL_UniDL", "mp4")
        );
    },
} satisfies FlapsCommand;
