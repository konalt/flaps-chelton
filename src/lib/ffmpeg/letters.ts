import { ffmpegBuffer, file, gifPalette } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

const supportedLetters = "abcdefghijklmnopqrstuvwxyz".split("");
const letterHeight = 200;

async function createLine(text: string) {
    let letters: Record<string, number> = {};
    let hstackFilter = ``;
    let hstackInputCount = 0;
    for (let char of text) {
        char = char.toLowerCase();
        if (!supportedLetters.includes(char)) continue;
        if (letters[char]) {
            letters[char]++;
        } else {
            letters[char] = 1;
        }
        hstackFilter += `[${char}${letters[char] - 1}]`;
        hstackInputCount++;
    }
    if (hstackInputCount == 1) {
        hstackFilter += `null[out]`;
    } else {
        hstackFilter += `hstack=inputs=${hstackInputCount}[out]`;
    }
    let inputs = Object.keys(letters)
        .map(
            (i) =>
                `${i == "q" ? "-stream_loop 2 " : ""}-i ${file(
                    `letters/${i}.gif`
                )}`
        )
        .join(" ");
    let filter = "";
    let i = 0;
    for (const [letter, count] of Object.entries(letters)) {
        filter += `[${i}:v]scale=-2:${letterHeight},setsar=1:1,split=${count}`;
        for (let j = 0; j < count; j++) {
            filter += `[${letter}${j}]`;
        }
        filter += `;`;
        i++;
    }
    return ffmpegBuffer(
        `${inputs} -filter_complex "${filter}${hstackFilter}" -shortest -map "[out]" $PRESET $OUT`,
        [],
        "mp4"
    );
}

export default async function letters(text: string) {
    let lineTexts = text.split(/[\s\n]/g);
    if (lineTexts.length > 10)
        throw new Error("Cannot have more than 10 lines");
    let lines = await Promise.all(lineTexts.map((l) => createLine(l)));
    let dims = await Promise.all(
        lines.map((l) => getVideoDimensions([l, "mp4"]))
    );
    let maxWidth = Math.max(...dims.map((d) => d[0]));

    let inputs = [];
    let filters = [];
    let stackInputs = [];
    for (let i = 0; i < dims.length; i++) {
        const [w] = dims[i];
        inputs.push(`-i $BUF${i}`);
        filters.push(
            `[${i}:v]pad=${maxWidth}:ih:${maxWidth / 2 - w / 2}:0:white[l${i}]`
        );
        stackInputs.push(`[l${i}]`);
    }
    if (stackInputs.length == 1) {
        filters.push(`${stackInputs[0]}scale=1000:-2[out]`);
    } else {
        filters.push(
            `${stackInputs.join("")}vstack=inputs=${
                stackInputs.length
            },scale=1000:-2[out]`
        );
    }
    return ffmpegBuffer(
        `${inputs.join(" ")} -filter_complex "${filters.join(";")};${gifPalette(
            "out",
            "out"
        )}" -map "[out]" $OUT`,
        lines.map((l) => [l, "mp4"]),
        "mp4"
    );
}
