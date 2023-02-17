import https from "https";
import fs from "fs";

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
                        file.close(() => {
                            resolve(null);
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
