import cp from "child_process";
import { getFileName, uuidv4 } from "../utils";
import { readFile, unlink, writeFile } from "fs/promises";
import { ffmpegBuffer } from "../ffmpeg/ffmpeg";

export function nyquistBuffer(
    script: string,
    file: [Buffer, string]
): Promise<Buffer> {
    return new Promise<Buffer>(async (resolve, reject) => {
        let id = uuidv4();
        let converted = await ffmpegBuffer("-i $BUF0 $OUT", [file], "wav");
        let inputFile = `images/cache/nqi${id}.wav`;
        let scriptFile = `images/cache/nqs${id}.ny`;
        let outputFile = `images/cache/nqo${id}.raw`;
        await writeFile(inputFile, converted);
        let inScript = await readFile(`ffscripts/${script}.ny`, "utf-8");
        inScript = inScript.replace(/\$NYIN/g, inputFile);
        inScript = inScript.replace(/\$NYOUT/g, outputFile);
        await writeFile(scriptFile, inScript);
        const childProcess = cp.spawn(
            process.env.NYQUIST_PATH,
            [`${scriptFile}`],
            {
                shell: true,
            }
        );
        let errorOutput = "";
        childProcess.stdout.on("data", (chunk: Buffer) => {
            if (chunk.toString().includes(">")) {
                childProcess.kill();
                console.log("closing");
            }
        });
        childProcess.on("exit", async (code) => {
            if (code == 0) {
                let file = await readFile(outputFile);
                let converted = await ffmpegBuffer(
                    `-i $BUF0 $OUT`,
                    [[file, "raw"]],
                    "mp3"
                );
                await Promise.all([
                    unlink(inputFile),
                    unlink(scriptFile),
                    unlink(outputFile),
                ]);
                resolve(converted);
            } else {
                await Promise.all([
                    unlink(inputFile),
                    unlink(scriptFile),
                    unlink(outputFile),
                ]).catch(() => {});
                reject(errorOutput);
            }
        });
    });
}
