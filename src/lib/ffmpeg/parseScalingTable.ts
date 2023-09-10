import { ffmpegBuffer } from "./ffmpeg";

let scalingTableHelpers = ["STR XPS YPS WTH HGT"];

export default function parseScalingTable(
    txt: string,
    v_width: number,
    v_height: number,
    v_length: number,
    in_buf: [Buffer, string]
) {
    let directives = txt
        .split("\n") // split on newlines
        .map((x) => x.trim().replace(/ +/g, " ")) // strip CR if windows, remove duplicate spaces
        .filter((x) => !scalingTableHelpers.includes(x.toUpperCase())) // remove helper lines
        .map((x) => x.split(" ").map((y) => parseInt(y))) // make array of numbers
        .map((x) => ({
            start: x[0],
            x: x[1],
            y: x[2],
            width: x[3],
            height: x[4],
        }));
    let directiveCount = directives.length;
    let filter = `color=s=${v_width}x${v_height}:c=black:d=${v_length}:r=30,format=rgba[static_bg];[static_bg]split=${directiveCount}`;
    for (const directiveNumber of directives.keys()) {
        filter += `[static_bg_${directiveNumber}]`;
    }
    filter += `;[0:v]null[input_image];[input_image]split=${directiveCount}`;
    for (const directiveNumber of directives.keys()) {
        filter += `[input_image_${directiveNumber}]`;
    }
    filter += `;`;
    for (const [directiveNumber, directive] of directives.entries()) {
        filter += `[input_image_${directiveNumber}]scale=${directive.width}:${directive.height}[input_image_scaled_${directiveNumber}];`;
    }
    for (const [directiveNumber, directive] of directives.entries()) {
        filter += `[static_bg_${directiveNumber}][input_image_scaled_${directiveNumber}]overlay=x=${directive.x}:y=${directive.y}[input_layer_${directiveNumber}];`;
    }
    filter += `[input_layer_0]null[compiled_layer_0];`;
    for (const [directiveNumber, directive] of directives.entries()) {
        if (directiveNumber == 0) continue;
        filter += `[compiled_layer_${
            directiveNumber - 1
        }][input_layer_${directiveNumber}]overlay=x='if(gte(n\\,${
            directive.start
        })\\,0\\,NAN)':y=0[compiled_layer_${directiveNumber}];`;
    }
    filter += `[compiled_layer_${directiveCount - 1}]null[scaling_result]`;
    return ffmpegBuffer(
        `-r 30 -t ${v_length} -i $BUF0 -filter_complex ${filter} -map "[scaling_result]" -t ${v_length} -r 30 $PRESET $OUT`,
        [in_buf],
        "mp4"
    );
}
