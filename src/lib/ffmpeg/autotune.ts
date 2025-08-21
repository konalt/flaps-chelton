import { NoteLUT } from "../utils";
import { ffmpegBuffer } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";
import multitempo from "./multitempo";

function tune(hz: number, base: number, noteDur: number) {
    return `asetrate=44100*(${hz}/${base}),aresample=44100,atempo=1/(${hz}/${base}),atrim=0:${noteDur}`;
}

export default async function autotune(
    buffers: [Buffer, string][],
    song: string
): Promise<Buffer> {
    if (song.startsWith("`")) song = song.split("`")[1];
    let dur = await getVideoLength(buffers[0]);
    let noteDur = 0.232;
    let speedupFactor = dur / noteDur;
    let noteRate: Record<string, number> = {};
    let songNotes = song.replace(/\r?\n/g, "").split(" ");
    for (const note of songNotes) {
        console.log(note.replace(/[_+-]/g, ""));
        if (!NoteLUT[note.replace(/[_+-]/g, "")]) continue;
        if (!noteRate[note]) noteRate[note] = 0;
        noteRate[note]++;
    }
    let filter = `[0:a]aresample=44100,${multitempo(speedupFactor)},asplit=${
        Object.keys(noteRate).length
    }`;
    for (const n of Object.keys(noteRate)) {
        if (!NoteLUT[n.replace(/[_+-]/g, "")]) continue;
        filter += `[t${n}]`;
    }
    filter += ";";
    for (const [note, inst] of Object.entries(noteRate)) {
        let long = note.endsWith("_");
        let short = note.endsWith("+");
        let xlong = note.endsWith("-");
        let tone = note;
        if (long || xlong || short) tone = tone.substring(0, tone.length - 1);
        filter += `[t${note}]`;
        filter += tune(NoteLUT[tone], NoteLUT.F5, noteDur);
        if (short) filter += ",atempo=2";
        if (long || xlong) filter += ",atempo=0.5";
        if (xlong) filter += ",atempo=0.5";
        filter += `,asplit=${inst}`;
        for (let i = 0; i < inst; i++) {
            filter += `[f${note}${i}]`;
        }
        filter += ";";
    }
    let noteRate2: Record<string, number> = {};
    let totalNotes = 0;
    for (const note of songNotes) {
        if (!NoteLUT[note.replace(/[_+-]/g, "")]) continue;
        if (!noteRate2[note]) noteRate2[note] = 0;
        filter += `[f${note}${noteRate2[note]}]`;
        noteRate2[note]++;
        totalNotes++;
    }
    filter += `concat=n=${totalNotes}:v=0:a=1[out]`;
    console.log(filter);
    return ffmpegBuffer(
        `-i $BUF0 -filter_complex "${filter}" -map "[out]" $OUT`,
        buffers
    );
}
