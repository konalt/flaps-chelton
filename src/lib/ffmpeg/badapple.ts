import { NoteLUT } from "../utils";
import { ffmpegBuffer } from "./ffmpeg";
import { getVideoLength } from "./getVideoDimensions";
import multitempo from "./multitempo";

function tune(hz: number, base: number, noteDur: number) {
    return `asetrate=44100*(${hz}/${base}),aresample=44100,atempo=1/(${hz}/${base}),atrim=0:${noteDur}`;
}

const BadApple = `
D E F G A_ D5 C5 A_ D_ A G F E D E F G A_ G F E D E F E D CS E D E F G A_ D5 C5 A_ D_ A G F E D E F G A_ G F E_ F_ G_ A_ 
D E F G A_ D5 C5 A_ D_ A G F E D E F G A_ G F E D E F E D CS E D E F G A_ D5 C5 A_ D_ A G F E D E F G A_ G F E_ F_ G_ A_ 
C5 D5 A G A_ G A C5 D5 A G A_ G A G F E C D_ C D E F G A D_ G A C5 D5 A G A_ G A C5 D5 A G A_ G A G F E C D_ C D E F G A D_ 
G A C5 D5 A G A_ G A C5 D5 A G A_ G A G F E C D_ C D E F G A D_ G A C5 D5 A G A_ G A C5 D5 A G A_ C5 D5 E5 D5 C5 A G_ F G F E D C D-
`
    .replace(/\r?\n/g, "")
    .split(" ");

export default async function badapple(
    buffers: [Buffer, string][]
): Promise<Buffer> {
    let dur = await getVideoLength(buffers[0]);
    let noteDur = 0.232;
    let speedupFactor = dur / noteDur;
    let noteRate: Record<string, number> = {};
    for (const note of BadApple) {
        if (!noteRate[note]) noteRate[note] = 0;
        noteRate[note]++;
    }
    let filter = `[0:a]${multitempo(speedupFactor)},asplit=${
        Object.keys(noteRate).length
    }`;
    for (const n of Object.keys(noteRate)) {
        filter += `[t${n}]`;
    }
    filter += ";";
    for (const [note, inst] of Object.entries(noteRate)) {
        let long = note.endsWith("_");
        let xlong = note.endsWith("-");
        let short = note.endsWith("+");
        let tone = note;
        if (long || xlong) tone = tone.substring(0, tone.length - 1);
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
    for (const note of BadApple) {
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
