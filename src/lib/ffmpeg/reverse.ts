import { ffmpegBuffer } from "./ffmpeg";

export default async function reverse(
    buffers: [Buffer, string][],
    isGIF: boolean
): Promise<Buffer> {
    return ffmpegBuffer(
        `-i $BUF0 -vf reverse${
            isGIF
                ? ",split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
                : " -af areverse"
        } $PRESET $OUT`,
        buffers
    );
}
