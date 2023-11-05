import SamJs from "sam-js";

// These were all taken from src/util/util.es6
// Because they couldn't expose the fucking functions

const text2Uint8Array = (text: string) => {
    const buffer = new Uint8Array(text.length);
    text.split("").forEach((e, index) => {
        buffer[index] = e.charCodeAt(0);
    });
    return buffer;
};
const Uint32ToUint8Array = (uint32: number) => {
    const result = new Uint8Array(4);
    result[0] = uint32;
    result[1] = uint32 >> 8;
    result[2] = uint32 >> 16;
    result[3] = uint32 >> 24;
    return result;
};
const Uint16ToUint8Array = (uint16: number) => {
    const result = new Uint8Array(2);
    result[0] = uint16;
    result[1] = uint16 >> 8;

    return result;
};

let sam = new SamJs();

function renderBuffer(audiobuffer: Uint8Array) {
    // Calculate buffer size.
    const realbuffer = new Uint8Array(
        4 + // "RIFF"
            4 + // uint32 filesize
            4 + // "WAVE"
            4 + // "fmt "
            4 + // uint32 fmt length
            2 + // uint16 fmt
            2 + // uint16 channels
            4 + // uint32 sample rate
            4 + // uint32 bytes per second
            2 + // uint16 block align
            2 + // uint16 bits per sample
            4 + // "data"
            4 + // uint32 chunk length
            audiobuffer.length
    );

    let pos = 0;
    const write = (buffer: Uint8Array) => {
        realbuffer.set(buffer, pos);
        pos += buffer.length;
    };

    //RIFF header
    write(text2Uint8Array("RIFF")); // chunkID
    write(Uint32ToUint8Array(audiobuffer.length + 12 + 16 + 8 - 8)); // ChunkSize
    write(text2Uint8Array("WAVE")); // riffType
    //format chunk
    write(text2Uint8Array("fmt "));
    write(Uint32ToUint8Array(16)); // ChunkSize
    write(Uint16ToUint8Array(1)); // wFormatTag - 1 = PCM
    write(Uint16ToUint8Array(1)); // channels
    write(Uint32ToUint8Array(22050)); // samplerate
    write(Uint32ToUint8Array(22050)); // bytes/second
    write(Uint16ToUint8Array(1)); // blockalign
    write(Uint16ToUint8Array(8)); // bits per sample
    //data chunk
    write(text2Uint8Array("data"));
    write(Uint32ToUint8Array(audiobuffer.length)); // buffer length
    write(audiobuffer);

    return realbuffer;
}

export function textToSpeechSAM(text: string) {
    let buf = sam.buf8(text);
    if (buf instanceof Boolean) return Uint8Array.from([]);
    return renderBuffer(buf);
}
