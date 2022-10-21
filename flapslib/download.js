const https = require("https");
const fs = require("fs");

var download = function(url, dest, cb) {
    if (dest == "dataurl") {
        https
            .get(url, function(res) {
                var data = [];

                res.on("data", function(chunk) {
                    data.push(chunk);
                }).on("end", function() {
                    var buffer = Buffer.concat(data);
                    cb(false, buffer);
                });
            })
            .on("error", function(err) {
                fs.unlink(dest, () => {});
                if (cb) cb(true, null);
            });
    } else {
        var file = fs.createWriteStream(dest);
        https
            .get(url, function(response) {
                if (response.statusCode != 200) {
                    return cb(true);
                }
                response.pipe(file);
                file.on("finish", function() {
                    file.close(cb);
                });
            })
            .on("error", function(err) {
                fs.unlink(dest, () => {});
                if (cb) cb(true);
            });
    }
};

module.exports = download;