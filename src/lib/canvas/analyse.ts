import { createCanvas } from "canvas";
import { drawText } from "./drawText";

const KEYBOARD_TEXT = `1234567890-=
qwertyuiop[]
asdfghjkl;'#
zxcvbnm,./`;
const KEYBOARD = KEYBOARD_TEXT.trim()
    .split("\n")
    .map((n) => n.trim());
const KEYBOARD_SHIFT_TEXT = `
!"£$%^&*()_+
QWERTYUIOP{}
ASDFGHJKL:@~
ZXCVBNM<>?`;
const KEYBOARD_SHIFT = KEYBOARD_SHIFT_TEXT.trim()
    .split("\n")
    .map((n) => n.trim());

const keySize = 110;
const rowOffset = 0.32;
const keyGap = 5;

function getCharIndex(char: string): [number, number] {
    let rowIndex = 0;
    for (const row of KEYBOARD) {
        if (row.includes(char)) return [rowIndex, row.indexOf(char)];
        if (KEYBOARD_SHIFT[rowIndex].includes(char))
            return [rowIndex, row.indexOf(char)];
        rowIndex++;
    }
    return [-1, -1];
}

function frequency(text: string) {
    let freqs: Record<string, number> = {};
    for (const char of text) {
        let i = getCharIndex(char);
        if (i[0] == -1) continue;
        let is = i.join();

        if (!freqs[is]) freqs[is] = 0;
        freqs[is]++;
    }
    return freqs;
}

export default async function analyse(text: string) {
    const freq = frequency(text);
    const max = Math.max(...Object.values(freq));

    const totalWidth =
        KEYBOARD.reduce((p, c) => {
            return p.length > c.length ? p : c;
        }).length *
            (keySize + keyGap) -
        keyGap;

    const [w, h] = [1600, 700];
    let c = createCanvas(w, h);
    let ctx = c.getContext("2d");

    ctx.fillStyle = "#f0f0f0ff";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111";
    ctx.font = "bold 70px 'Open Sans', sans-serif";
    await drawText(ctx, `"${text}"`, w / 2, 30, w * 0.8);

    ctx.save();
    ctx.translate((w - totalWidth) / 2, 230);

    ctx.font = "bold 40px 'Open Sans', sans-serif";

    let rowIndex = 0;
    for (const row of KEYBOARD) {
        let keyIndex = 0;
        for (const key of row) {
            const is = `${rowIndex},${keyIndex}`;
            const keyUpper = KEYBOARD_SHIFT[rowIndex][keyIndex];
            ctx.fillStyle = "#222";
            ctx.fillRect(keyIndex * (keySize + keyGap), 0, keySize, keySize);
            if (freq[is]) {
                ctx.globalAlpha = (freq[is] / max) * 0.7;
                ctx.fillStyle = "#ff0000ff";
                ctx.fillRect(
                    keyIndex * (keySize + keyGap),
                    0,
                    keySize,
                    keySize
                );
                ctx.globalAlpha = 1;
            }
            ctx.fillStyle = "white";
            if (key.toUpperCase() == keyUpper) {
                ctx.fillText(
                    keyUpper,
                    keyIndex * (keySize + keyGap) + keySize / 2,
                    keySize / 2
                );
            } else {
                ctx.fillText(
                    keyUpper,
                    keyIndex * (keySize + keyGap) + keySize / 2,
                    keySize * 0.25
                );
                ctx.fillText(
                    key,
                    keyIndex * (keySize + keyGap) + keySize / 2,
                    keySize * 0.75
                );
            }
            keyIndex++;
        }
        rowIndex++;
        ctx.translate(rowOffset * keySize, keySize + keyGap);
    }

    ctx.restore();

    return c.toBuffer();
}
