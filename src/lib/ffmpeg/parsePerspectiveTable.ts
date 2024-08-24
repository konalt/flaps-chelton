import { ffmpegBuffer } from "./ffmpeg";

let scalingTableHelpers = ["STR TLX TLY TRX TRY BLX BLY BRX BRY"];

export default function parsePerspectiveTable(
    txt: string,
    v_width: number,
    v_height: number,
    v_length: number,
    fps: number,
    in_buf: [Buffer, string]
) {
    let directives = txt
        .split("\n") // split on newlines
        .map((x) => x.trim().replace(/ +/g, " ")) // strip CR if windows, remove duplicate spaces
        .filter((x) => !scalingTableHelpers.includes(x.toUpperCase())) // remove helper lines
        .map((x) => x.split(" ").map((y) => parseInt(y))); // make array of numbers
    let directiveCount = directives.length;
    let filter = `color=s=${v_width}x${v_height}:c=black:d=${v_length}:r=${fps},format=rgba[static_bg];[0:v]scale=${v_width}:${v_height},setsar=1:1,split=${directiveCount}`;
    for (let i = 0; i < directiveCount; i++) {
        filter += `[i_${i}]`;
    }
    filter += ";";
    for (let i = 0; i < directiveCount; i++) {
        filter += `[i_${i}]perspective=${directives[i]
            .slice(1)
            .join(":")}:sense=1[p_${i}];`;
    }
    filter += "[static_bg]";
    for (let i = 0; i < directiveCount; i++) {
        let end = v_length * fps;
        if (i < directiveCount - 1) {
            end = directives[i + 1][0];
        }
        filter += `[p_${i}]overlay=0:0:enable='between(n\\,${directives[i][0]}\\,${end})'[static_bg_a${i}];[static_bg_a${i}]`;
    }
    filter += "null[scaling_result]";
    return ffmpegBuffer(
        `-r ${fps} -t ${v_length} -i $BUF0 -filter_complex "${filter}" -map "[scaling_result]" -t ${v_length} -r ${fps} $PRESET $OUT`,
        [in_buf],
        "mp4"
    );
}
