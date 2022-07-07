const { sendWebhook } = require("./webhooks");
const fs = require("fs");
var blackCards = fs.readFileSync("./cah_black.txt").toString().split("\n");
var whiteCards = fs.readFileSync("./cah_white.txt").toString().split("\n");

function get() {
    var chosenBlack = blackCards[Math.floor(Math.random() * blackCards.length)];
    var drawAmount = (chosenBlack.match(/____/g) || []).length;
    var upper = (chosenBlack.toUpperCase() == chosenBlack);
    for (let i = 0; i < drawAmount; i++) {
        var chosen = whiteCards[Math.floor(Math.random() * whiteCards.length)];
        chosen = chosen.toLowerCase().replace(/\./g, "");
        if (upper) chosen = chosen.toUpperCase();
        chosenBlack = chosenBlack.replace(/____/, chosen).replace(/(^\w{1}|(\.\?\!)\s*\w{1})/gi, function(toReplace) {
            return toReplace.toUpperCase();
        });
    }
    return chosenBlack;
}

function cah(channel) {
    sendWebhook("cah", get(), false, channel);
}

module.exports = {
    cah: cah,
    cahWhiteCard: (custom) => {
        return custom ? whiteCards[Math.floor(Math.random() * (whiteCards.length - 2042) + 2042)] : whiteCards[Math.floor(Math.random() * whiteCards.length)];
    }
}