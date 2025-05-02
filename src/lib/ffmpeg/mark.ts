import { ffmpegBuffer, file } from "./ffmpeg";

// 914 114
// 1410 409

export default function mark(buffers: [Buffer, string][]) {
    return ffmpegBuffer(
        `-i ${file(
            "mark.mp4"
        )} -i $BUF0 -f lavfi -i color=s=1920x1080:d=15:c=black -filter_complex "[1:v]scale=496:296[i];[2:v][i]overlay=914:114[x];[0:v]colorkey=0x00FF00:0.2:0.2[m];[x][m]overlay=0:0[o];[0:a]anull[a]" -map "[o]" -map "[a]" -shortest $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
