const https = require("https");
const fs = require('fs');

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {
        if (response.statusCode != 200) {
            return cb(true);
        }
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb); // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
        if (cb) cb(true);
    });
};

module.exports = download;