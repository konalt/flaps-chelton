const yt = require("./yt");
const ai = require("./ai");
const video = require("./video");
const steam = require("./steam");
const webhooks = require("./webhooks");
const download = require("./download");
const fetchapis = require("./fetchapis");
const moviereview = require("./moviereview");
const videowrapper = require("./videowrapper");
const watchparty = require("./watchparty-server");
const { cah, cahWhiteCard } = require("./cardsagainsthumanity");

module.exports = {
    yt: yt,
    ai: ai,
    webhooks: webhooks,
    download: download,
    video: video,
    videowrapper: videowrapper,
    fetchapis: fetchapis,
    watchparty_init: watchparty,
    steam: steam,
    moviereview: moviereview,
    cah: cah,
    cahWhiteCard: cahWhiteCard
}