import { writeFile } from "fs/promises";
import { getVideoDimensions } from "./getVideoDimensions";
import { CaptionOptions } from "../../types";
import { scheduleDelete, uuidv4 } from "../utils";
import { ffmpegBuffer, file } from "./ffmpeg";

export default async function caption(
    buffers: [Buffer, string][],
    options: CaptionOptions
): Promise<Buffer> {
    let cFontSize = options.fontsize;
    let fontSize =
        (await getVideoDimensions(buffers[0]))[1] * 0.1 * (cFontSize / 30);
    let captionfile = file("cache/" + uuidv4());
    var subtitleFileData = `1
00:00:00,000 --> 00:50:00,000
${options.text.split(":")[0]}`;
    var subtitleFileData2 = `1
00:00:00,000 --> 00:50:00,000
${options.text.split(":")[1] || " "}`;
    await writeFile(captionfile + "0.srt", subtitleFileData);
    await writeFile(captionfile + "1.srt", subtitleFileData2);
    return new Promise((resolve, reject) => {
        ffmpegBuffer(
            `-i $BUF0 -vf "subtitles=f=${
                captionfile.replace(/[\/\\]/g, "\\/") + "0.srt"
            }:force_style='Fontname=Impact,Fontsize=${fontSize},Alignment=6,MarginV=0',subtitles=f=${
                captionfile.replace(/[\/\\]/g, "\\/") + "1.srt"
            }:force_style='Fontname=Impact,Fontsize=${fontSize},Alignment=2,MarginV=0'" $PRESET $OUT`,
            buffers
        )
            .then((buffer) => {
                scheduleDelete(captionfile + "0.srt", 5);
                scheduleDelete(captionfile + "1.srt", 5);
                resolve(buffer);
            })
            .catch((error) => {
                reject(error);
            });
    });
    return;
}
