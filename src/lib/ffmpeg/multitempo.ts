export default function multitempo(tempo: number) {
    let fil = [];
    if (tempo < 0.5) {
        while (tempo < 0.5) {
            fil.push("atempo=0.5");
            tempo *= 2;
        }
    } else if (tempo > 100) {
        while (tempo > 100) {
            fil.push("atempo=100");
            tempo /= 100;
        }
    }
    fil.push("atempo=" + tempo);
    return fil.join(",");
}
