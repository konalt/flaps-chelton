const SteamAPI = require("steamapi");
const fetch = require("node-fetch");
const steam = new SteamAPI("6E7086F1D33CC3B8D51AE5C2DF2AC146");

function addToGMODCollections(itemID) {
    fetch("https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/", {
        "method": "POST",
        "collectioncount": 1,
        "publishedfileids[0]": 2632100099,
        "input_json": JSON.stringify({
            "collectioncount": 1,
            "publishedfileids[0]": 2632100099
        })
    }).then(r => r.text()).then(console.log);
    //steam.get("/ISteamRemoteStorage/GetCollectionDetails/v1/?input_json={\"collectioncount\":1\"publishedfileids[0]\"=2632100099}").then(console.log);
}

module.exports = {
    addToGMODCollections: addToGMODCollections
}