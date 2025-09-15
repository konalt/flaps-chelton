import { unlink, writeFile } from "fs/promises";
import { ffmpegBuffer, file } from "./ffmpeg";
import { getFileName } from "../utils";

let scalingTableHelpers = ["STR TLX TLY TRX TRY BLX BLY BRX BRY"];

function lerp(a: number, b: number, v: number) {
    v = Math.min(1, v);
    return (1 - v) * a + b * v;
}

export default async function parsePerspectiveTable(
    txt: string,
    v_width: number,
    v_height: number,
    v_length: number,
    fps: number,
    in_buf: [Buffer, string],
    multiplicative = false,
    enableLerp = false,
    overrideVideoSize = [-1, -1],
    frameMultiplier = 1,
    frameOffset = 0
) {
    if (overrideVideoSize[0] == -1) overrideVideoSize[0] = v_width;
    if (overrideVideoSize[1] == -1) overrideVideoSize[1] = v_height;
    let directives = txt
        .split("\n") // split on newlines
        .map((x) => x.trim().replace(/ +/g, " ")) // strip CR if windows, remove duplicate spaces
        .filter((x) => !scalingTableHelpers.includes(x.toUpperCase())) // remove helper lines
        .map((x) => x.split(" ").map((y) => parseFloat(y))); // make array of numbers
    directives = directives.map((d) => {
        return [Math.round(d[0] * frameMultiplier), ...d.slice(1)];
    });
    if (enableLerp) {
        let newDirectives = [];
        let frameCount = directives.at(-1)[0];
        let lastDirective = directives[0];
        let nextDirective = directives[1];
        let nextDirectiveIndex = 1;
        let directiveDifference = nextDirective[0] - lastDirective[0];
        let sinceChange = 0;
        for (let i = 0; i < frameCount; i++) {
            if (nextDirective[0] == i) {
                lastDirective = [...nextDirective];
                nextDirective = directives[++nextDirectiveIndex];
                if (!nextDirective) nextDirective = directives.at(-1);
                directiveDifference = nextDirective[0] - lastDirective[0];

                sinceChange = 0;
            }
            let newDirective = [i];
            let j = 1;
            for (const value of lastDirective.slice(1)) {
                newDirective.push(
                    lerp(
                        value,
                        nextDirective[j],
                        sinceChange / directiveDifference
                    )
                );
                j++;
            }
            newDirectives.push(newDirective);
            sinceChange++;
        }
        directives = newDirectives;
    }
    let directiveCount = directives.length;
    let filter = `color=s=${v_width}x${v_height}:c=black:d=${v_length}:r=${fps},format=rgba[b];[0:v]scale=${v_width}:${v_height},setsar=1:1,split=${directiveCount}`;
    for (let i = 0; i < directiveCount; i++) {
        filter += `[${i}]`;
    }
    filter += ";";
    for (let i = 0; i < directiveCount; i++) {
        let isY = false;
        filter += `[${i}]perspective=${directives[i]
            .slice(1)
            .map((a) => {
                if (!multiplicative) return a;
                if (!isY) {
                    isY = !isY;
                    return Math.round(
                        a * overrideVideoSize[0] +
                            (v_width - overrideVideoSize[0]) / 2
                    );
                }
                isY = !isY;
                return Math.round(
                    a * overrideVideoSize[1] +
                        (v_height - overrideVideoSize[1]) / 2
                );
            })
            .join(":")}:sense=1[_${i}];`;
    }
    filter += "[b]";
    for (let i = 0; i < directiveCount; i++) {
        let end = v_length * fps;
        if (i < directiveCount - 1) {
            end = directives[i + 1][0];
        }
        filter += `[_${i}]overlay=0:0:enable='between(n\\,${directives[i][0]}\\,${end})'[a${i}];[a${i}]`;
    }
    filter += "null[scaling_result]";
    let scriptname = file("cache/" + getFileName("Perspective", "ffscript"));
    await writeFile(scriptname, filter);
    let out = await ffmpegBuffer(
        `-r ${fps} -t ${v_length} -i $BUF0 -filter_complex_script ${scriptname} -map "[scaling_result]" -t ${v_length} -r ${fps} $PRESET $OUT`,
        [in_buf],
        "mp4"
    );
    await unlink(scriptname);
    return out;
}
