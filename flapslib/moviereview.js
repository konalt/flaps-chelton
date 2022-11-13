var DomParser = require("dom-parser");
var { sendWebhook } = require("./webhooks");
var parser = new DomParser();
var fetch = require("node-fetch");
const { addError } = require("./analytics");

async function morbiusReview(msgChannel) {
    try {
        fetch("https://www.metacritic.com/movie/morbius/user-reviews", {
                credentials: "include",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Cache-Control": "max-age=0",
                },
                referrer: "https://www.metacritic.com/movie/morbius",
                method: "GET",
                mode: "cors",
            })
            .then((r) => r.text())
            .then((resp) => {
                var document = parser.parseFromString(resp);
                var reviews =
                    document.getElementsByClassName("review pad_top1");
                try {
                    var chosen =
                        reviews[Math.floor(Math.random() * reviews.length)]
                        .childNodes[3].childNodes[3].childNodes[1]
                        .childNodes[1].childNodes[1].textContent;
                    if (chosen.includes("click expand to view")) {
                        throw new Error();
                    }
                    console.log(chosen);
                    sendWebhook("morbius", chosen, msgChannel);
                } catch {
                    var chosen =
                        reviews[Math.floor(Math.random() * reviews.length)]
                        .childNodes[3].childNodes[3].childNodes[1]
                        .childNodes[1].textContent;
                    console.log(chosen);
                    sendWebhook("morbius", chosen, msgChannel);
                }
            });
    } catch (e) {
        addError(e);
        console.log("aw");
        console.log(e);
    }
}

module.exports = {
    morbiusReview: morbiusReview,
};