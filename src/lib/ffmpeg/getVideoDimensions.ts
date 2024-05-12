import { ffprobe } from "./ffmpeg";

export async function getVideoLength(
    buffer: [Buffer, string]
): Promise<number> {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $BUF0",
            buffer
        )
            .then((txt) => {
                res(parseFloat(txt));
            })
            .catch(rej);
    });
}
export async function getVideoDimensions(
    buffer: [Buffer, string],
    makeEven: boolean = false
): Promise<[number, number]> {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $BUF0",
            buffer
        )
            .then((txt) => {
                let dims = txt.split("x").map(parseFloat) as [number, number];
                if (makeEven)
                    dims = dims.map((d) => Math.ceil(d / 2) * 2) as [
                        number,
                        number
                    ];
                res(dims);
            })
            .catch(rej);
    });
}
export async function getFrameCount(buffer: [Buffer, string]): Promise<number> {
    return new Promise((res, rej) => {
        ffprobe(
            "-v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -print_format default=nokey=1:noprint_wrappers=1 $BUF0",
            buffer
        )
            .then((txt) => {
                res(parseInt(txt));
            })
            .catch(rej);
    });
}
