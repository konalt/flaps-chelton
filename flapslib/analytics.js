const os = require("os-utils");
const Discord = require("discord.js");

var analytics = {
    uptime: 0,
    errors: [],
    messages: [],
    stats: [],
};

var start = Date.now();

/**
 *
 * @param {Discord.Message} msg
 */
function addMessage(msg) {
    analytics.messages.push({
        author: msg.author.username,
        content: msg.content,
        time: msg.createdTimestamp,
    });
}

function addError(err) {
    console.error(err);
    analytics.errors.push(err.toString());
}

function getAnalytics() {
    return analytics;
}

function getStats() {
    return new Promise((res, rej) => {
        var s = {
            cpu: 0,
            mem: process.memoryUsage().rss / 1024 / 1024 / 16384,
            time: Date.now(),
        };
        os.cpuUsage(function(v) {
            s.cpu = v;
            res(s);
        });
    });
}

setInterval(() => {
    analytics.uptime = Date.now() - start;
    getStats().then((stats) => {
        if (analytics.stats.length == 20) analytics.stats.shift();
        analytics.stats.push(stats);
    });
}, 1000);

module.exports = {
    addError: addError,
    addMessage: addMessage,
    getAnalytics: getAnalytics,
};