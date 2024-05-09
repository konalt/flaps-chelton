import compressImage from "../lib/ffmpeg/compressimage";
import { file } from "../lib/ffmpeg/ffmpeg";
import { Color, esc, log } from "../lib/logger";
import {
    getFileExt,
    humanFileSize,
    makeMessageResp,
    uuidv4,
} from "../lib/utils";
import { FlapsCommand } from "../types";
import { writeFile } from "fs/promises";

module.exports = {
    id: "imgurl",
    name: "Image URL",
    desc: "Provides a permanent image URL for your uploaded image.",
    aliases: ["img", "imageurl", "image"],
    needs: ["image", "image?", "image?", "image?"],
    async execute(_, buffers) {
        let writePromises = [];
        let filenames = [];
        for (const [buffer, filename] of buffers) {
            let id = uuidv4();
            let compressed = await compressImage([buffer, filename]);
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
            writePromises.push(writeFile(file(`perma/${id}.jpeg`), compressed));
            filenames.push(`${id}.jpeg`);
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
