import { ffprobe } from "./ffmpeg";

export async function getVideoLength(path: string): Promise<number> {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 " +
                path
        )
            .then((txt) => {
                res(parseFloat(txt));
            })
            .catch(rej);
    });
}
export async function getVideoDimensions(
    path: string
): Promise<[number, number]> {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 " +
                path
        )
            .then((txt) => {
                res(txt.split("x").map(parseFloat) as [number, number]);
            })
            .catch(rej);
    });
}
export async function getFrameCount(path: string): Promise<number> {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -print_format default=nokey=1:noprint_wrappers=1 " +
                path
        )
            .then((txt) => {
                res(parseInt(txt));
            })
            .catch(rej);
    });
}
