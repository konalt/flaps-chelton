import express from "express";
import { getFileExt, uuidv4 } from "./utils";

export default function filestreamServer(): Promise<
    [(buffer: Buffer, ext: string) => string, (string: string) => void]
> {
    return new Promise((resolve) => {
        const app = express();
        let files: Record<string, Buffer> = {};
        app.get("/", (req, res) => {
            res.status(400).contentType("txt").send("400 Bad Request");
        });
        app.get("/filelist", (req, res) => {
            res.contentType("txt").send(Object.keys(files).join("\n"));
        });
        app.get("/:fileID", (req, res) => {
            let fileID = req.params.fileID;
            let file = files[fileID];
            if (!file) {
                res.status(404).contentType("txt").send("404 Not Found");
                return;
            }
            res.setHeader("Accept-Ranges", "bytes");
            let trimmedBuffer = file;
            let status = 200;
            if (req.headers.range) {
                let byteRange = req.headers.range.split("=")[1].split("-");
                trimmedBuffer = file.subarray(
                    parseInt(byteRange[0]),
                    byteRange[1] ? parseInt(byteRange[1]) : file.byteLength
                );
                status = 206;
                res.setHeader(
                    "Content-Range",
                    "bytes " +
                        byteRange[0] +
                        "-" +
                        (byteRange[1] ?? file.byteLength) +
                        "/" +
                        file.byteLength
                );
            }
            res.status(status)
                .contentType(getFileExt(fileID))
                .send(trimmedBuffer);
        });
        function addBuffer(buffer: Buffer, ext: string): string {
            let fileID = uuidv4() + "." + ext;
            files[fileID] = buffer;
            return fileID;
        }
        function removeBuffer(fileID: string) {
            delete files[fileID];
        }
        app.listen(56033, () => {
            resolve([addBuffer, removeBuffer]);
        });
    });
}
