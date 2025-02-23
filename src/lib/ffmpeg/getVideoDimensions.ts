import { ffprobe } from "./ffmpeg";

export async function getVideoLength(buffer: [Buffer, string]) {
    let text = await ffprobe(
        "-v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $BUF0",
        buffer
    );
    return parseFloat(text);
}
export async function getVideoDimensions(
    buffer: [Buffer, string],
    makeEven: boolean = false
) {
    let text = await ffprobe(
        "-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $BUF0",
        buffer
    );
    let dimensions = text.split("x").map(parseFloat) as [number, number];
    if (makeEven) {
        dimensions = dimensions.map((d) => Math.ceil(d / 2) * 2) as [
            number,
            number
        ];
    }
    return dimensions;
}
export async function getFrameCount(buffer: [Buffer, string]): Promise<number> {
    let text = await ffprobe(
        "-v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -print_format default=nokey=1:noprint_wrappers=1 $BUF0",
        buffer
    );
    return parseInt(text);
}
export async function getFrameRate(buffer: [Buffer, string]): Promise<number> {
    let [length, frames] = await Promise.all([
        getVideoLength(buffer),
        getFrameCount(buffer),
    ]);
    return frames / length;
}
