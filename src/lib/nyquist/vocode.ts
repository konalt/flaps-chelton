import { readFile } from "fs/promises";
import { ffmpegBuffer, file } from "../ffmpeg/ffmpeg";
import { nyquistBuffer } from "./nyquist";

export default async function vocode(
    modulation: [Buffer, string],
    carrier?: [Buffer, string]
) {
    if (!carrier) {
        carrier = [await readFile(file("gangsta.mp3")), "mp3"];
    }
    let split = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:a]channelsplit=channel_layout=stereo:channels=FL[mod];[1:a]channelsplit=channel_layout=stereo:channels=FR[car];[mod][car]amerge=inputs=2[out]" -map "[out]" -shortest $OUT`,
        [modulation, carrier],
        "mp3"
    );
    let output = await nyquistBuffer("vocoder", [split, "mp3"]);
    return output;
}
