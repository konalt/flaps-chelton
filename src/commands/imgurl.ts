import compressImage from "../lib/ffmpeg/compressimage";
import { file } from "../lib/ffmpeg/ffmpeg";
import { Color, esc, log } from "../lib/logger";
import { exists, humanFileSize, makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { writeFile } from "fs/promises";
import { createHash } from "crypto";

module.exports = {
    id: "imgurl",
    name: "Image URL",
    desc: "Provides a permanent image URL for your uploaded image.",
    aliases: ["img", "imageurl", "image"],
    needs: [
        "image",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
    ],
    async execute(_, buffers) {
        let writePromises = [];
        let filenames = Array(buffers.length).fill("");
        for (const [i, [buffer, origFilename]] of Object.entries(buffers)) {
            writePromises.push(
                new Promise<void>(async (resolve, reject) => {
                    let compressed = await compressImage([
                        buffer,
                        origFilename,
                    ]);
                    log(
                        `Uploaded image compressed to ${esc(
                            Color.BrightCyan
                        )}${humanFileSize(compressed.byteLength)}${esc(
                            Color.White
                        )} (from ${esc(Color.BrightRed)}${humanFileSize(
                            buffer.byteLength
                        )}${esc(Color.White)})`,
                        "permaurl"
                    );
                    let hash = createHash("sha256")
                        .update(compressed)
                        .digest("hex");
                    let filename = file(`perma/${hash}.jpeg`);
                    let fileExists = await exists(filename);
                    if (!fileExists) {
                        await writeFile(filename, compressed);
                    }
                    filenames[i] = `${hash}.jpeg`;
                    resolve();
                })
            );
        }
        await Promise.all(writePromises);
        let outstring = "";
        for (const filename of filenames) {
            outstring += `<https://flaps.us.to/img/${filename}>\n`;
        }
        outstring = outstring.trim();
        return makeMessageResp(
            "flaps",
            `Your image URL${filenames.length > 1 ? "s" : ""}:\n${outstring}`
        );
    },
} satisfies FlapsCommand;
