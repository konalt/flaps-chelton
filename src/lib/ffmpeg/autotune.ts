import { ffmpegBuffer } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";

function tune(hz: number, base: number, noteDur: number) {
    return `asetrate=44100*(${hz}/${base}),aresample=44100,atempo=1/(${hz}/${base}),atrim=0:${noteDur}`;
}

const NoteLUT = {
    C: 262,
    CS: 277,
    D: 294,
    DS: 311,
    E: 330,
    F: 349,
    FS: 370,
    G: 392,
    GS: 415,
    A: 440,
    AS: 466,
    B: 494,
    C5: 523,
    CS5: 554,
    D5: 587,
    DS5: 622,
    E5: 659,
};

export default async function autotune(
    buffers: [Buffer, string][],
    song: string
): Promise<Buffer> {
    let dur = await getVideoLength(buffers[0]);
    let noteDur = 0.232;
    let speedupFactor = dur / noteDur;
    let noteRate: Record<string, number> = {};
    let songNotes = song.replace(/\r?\n/g, "").split(" ");
    for (const note of songNotes) {
        if (!noteRate[note]) noteRate[note] = 0;
        noteRate[note]++;
    }
    let filter = `[0:a]atempo=${speedupFactor},asplit=${
        Object.keys(noteRate).length
    }`;
    for (const n of Object.keys(noteRate)) {
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
        filter += tune(NoteLUT[tone], NoteLUT.A, noteDur);
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
