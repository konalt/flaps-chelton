import https from "https";
import fs from "fs";
import { readFile } from "fs/promises";

export const downloadPromise = function (
    url: string,
    dest: string | null = null
): Promise<Buffer | null> {
    return new Promise((resolve, reject) => {
        if (dest == null) {
            https
                .get(url, function (res) {
                    var data: Buffer[] = [];

                    res.on("data", function (chunk: Buffer) {
                        data.push(chunk);
                    }).on("end", function () {
                        var buffer = Buffer.concat(data);
                        resolve(buffer);
                    });
                })
                .on("error", function (err) {
                    fs.unlink(dest, () => {});
                    reject(err);
                });
        } else {
            var file = fs.createWriteStream(dest);
            https
                .get(url, function (response) {
                    if (response.statusCode != 200) {
                        reject(response);
                    }
                    response.pipe(file);
                    file.on("finish", function () {
                        file.close(async () => {
                            resolve(await readFile(dest));
                        });
                    });
                })
                .on("error", function (err) {
                    fs.unlink(dest, () => {});
                    reject(err);
                });
        }
    });
};

export const download = function (
    url: string,
    dest: string,
    cb: (err: boolean, buffer: Buffer) => {}
) {
    if (dest == "dataurl") {
        https
            .get(url, function (res) {
                var data = [];

                res.on("data", function (chunk) {
                    data.push(chunk);
                }).on("end", function () {
                    var buffer = Buffer.concat(data);
                    cb(false, buffer);
                });
            })
            .on("error", function (err) {
                fs.unlink(dest, () => {});
                if (cb) cb(true, null);
            });
    } else {
        var file = fs.createWriteStream(dest);
        https
            .get(url, function (response) {
                if (response.statusCode != 200) {
                    return cb(true, null);
                }
                response.pipe(file);
                file.on("finish", function () {
                    file.close(() => {
                        cb(false, null);
                    });
                });
            })
            .on("error", function (err) {
                fs.unlink(dest, () => {});
                if (cb) cb(true, null);
            });
    }
};
