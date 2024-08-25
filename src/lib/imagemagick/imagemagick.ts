import cp from "child_process";

export function imagemagickBuffer(
    args: string,
    buffer: Buffer
): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const childProcess = cp.spawn("magick", `- ${args} png:`.split(" "), {
            shell: true,
        });
        let chunkedOutput = [];
        childProcess.stdout.on("data", (chunk: Buffer) => {
            chunkedOutput.push(chunk);
        });
        let errorOutput = "";
        childProcess.stderr.on("data", (chunk: Buffer) => {
            errorOutput += chunk.toString();
        });
        childProcess.on("exit", (code) => {
            let file = Buffer.concat(chunkedOutput);
            if (code == 0) {
                resolve(file);
            } else {
                reject(errorOutput);
            }
        });
        childProcess.stdin.end(buffer);
    });
}
