import { writeFile } from "fs/promises";
import { getVideoDimensions } from "./getVideoDimensions";
import { CaptionOptions } from "../../types";
import { uuidv4 } from "../utils";
import { ffmpegBuffer, file, preset } from "./ffmpeg";

export default async function caption(
    buffers: [Buffer, string][],
    options: CaptionOptions
): Promise<Buffer> {
    let cFontSize = options.fontsize;
    let fontSize =
        (await getVideoDimensions(file(buffers[0][1])))[1] *
        0.1 *
        (cFontSize / 30);
    let captionfile = file("cache/" + uuidv4());
    var subtitleFileData = `1
00:00:00,000 --> 00:50:00,000
${options.text.split(":")[0]}`;
    var subtitleFileData2 = `1
00:00:00,000 --> 00:50:00,000
${options.text.split(":")[1] || ""}`;
    await writeFile(captionfile + "0.srt", subtitleFileData);
    await writeFile(captionfile + "1.srt", subtitleFileData2);
    return ffmpegBuffer(
        `-i $BUF0 -vf "subtitles=f=${
            captionfile.replace(/[\/\\]/g, "\\/") + "0.srt"
        }:force_style='Fontname=Impact,Fontsize=${fontSize},Alignment=6,MarginV=0',subtitles=f=${
            captionfile.replace(/[\/\\]/g, "\\/") + "1.srt"
        }:force_style='Fontname=Impact,Fontsize=${fontSize},Alignment=2,MarginV=0'" $OUT`,
        buffers
    );
}
