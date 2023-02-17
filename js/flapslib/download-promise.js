const https = require("https");
const fs = require("fs");

var download = function (url, dest) {
    return new Promise((resolve, reject) => {
        if (dest == "dataurl") {
            https
                .get(url, function (res) {
                    var data = [];

                    res.on("data", function (chunk) {
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
                            resolve();
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

module.exports = download;
