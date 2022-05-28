const fs = require("fs");
var cards = fs.readFileSync("cah.txt").toString().split("\n");
var blackCards = [];
var whiteCards = [];
var readingWhiteCards = false;
cards.forEach(card => {
    if (!card.split("\t")[1]) {
        readingWhiteCards = true;
    } else {
        if (readingWhiteCards) {
            var parsed = card.split("\t")[1];
            console.log("WHITE: " + parsed);
            whiteCards.push(parsed);
        } else {
            var parsed = card.split("\t")[3] + (card.split("\t")[3].includes("____") ? "" : " ____".repeat(parseInt(card.split("\t")[1])));
            console.log("BLACK: " + parsed);
            blackCards.push(parsed);
        }
    }
});

console.log(blackCards.length, " black cards");
console.log(whiteCards.length, " white cards");

fs.writeFileSync("./cah_black.txt", blackCards.join("\n"));
fs.writeFileSync("./cah_white.txt", whiteCards.join("\n"));