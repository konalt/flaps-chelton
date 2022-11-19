const fs = require("fs");
var help = {};

function updateHelp() {
    help = {};
    fs.readdirSync("./help/cmd").forEach((file) => {
        help[file.split(".")[0]] = fs
            .readFileSync("./help/cmd/" + file)
            .toString();
    });
}

function getHelp(cmd) {
    return help[cmd] || "Error: No help found for " + cmd;
}

module.exports = { updateHelp, getHelp };