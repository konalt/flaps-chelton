const yt = require("./yt");
const ai = require("./ai");
const video = require("./video");
const canvas = require("./canvas");
const webhooks = require("./webhooks");
const download = require("./download");
const analytics = require("./analytics");
const fetchapis = require("./fetchapis");
const translator = require("./translator");
const moviereview = require("./moviereview");
const videowrapper = require("./videowrapper");
const watchparty = require("./watchparty-server");
const downloadPromise = require("./download-promise");
const { makesweet, reverseMakesweet } = require("./mkswt");
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
    moviereview: moviereview,
    cah: cah,
    cahWhiteCard: cahWhiteCard,
    makesweet: makesweet,
    reverseMakesweet: reverseMakesweet,
    canvas: canvas,
    translator: translator,
    downloadPromise: downloadPromise,
    analytics: analytics,
};