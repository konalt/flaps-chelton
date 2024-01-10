import { ffmpegBuffer } from "./ffmpeg";
import { getVideoDimensions } from "./getVideoDimensions";

export default async function baitswitch(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    var dims = await getVideoDimensions(buffers[0]);
    return ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v]scale=ceil(${dims[0]}/2)*2:ceil(${dims[1]}/2)*2,setsar=1:1[v0];[1:v]scale=ceil(${dims[0]}/2)*2:ceil(${dims[1]}/2)*2,setsar=1:1[v1];[v0][v1]concat[vout]" -map "[vout]" -map "1:a" -vsync 2 $PRESET $OUT`,
        buffers,
        "mp4"
    );
}
