import express from "express";
import { getFileExt, uuidv4 } from "./utils";

export default function filestreamServer(): Promise<
    [(buffer: Buffer, ext: string) => string, (string: string) => void]
> {
    return new Promise((resolve) => {
        const app = express();
        let files: Record<string, Buffer> = {
            "testfile.txt": Buffer.from("This is a test file.\noozi oozi"),
        };
        app.get("/", (req, res) => {
            res.status(400).contentType("txt").send("400 Bad Request");
        });
        app.get("/:fileID", (req, res) => {
            let fileID = req.params.fileID;
            let file = files[fileID];
            if (!file) {
                res.status(404).contentType("txt").send("404 Not Found");
                return;
            }
            res.contentType(getFileExt(fileID)).send(file);
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
