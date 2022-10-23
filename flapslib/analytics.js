const os = require("os-utils");
const Discord = require("discord.js");

var analytics = {
    startTime: Date.now(),
    errors: [],
    messages: [],
    stats: [],
};

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
    analytics.errors.push(err);
}

function getAnalytics() {
    return analytics;
}

function getStats() {
    return new Promise((res, rej) => {
        var s = {
            cpu: 0,
            mem: process.memoryUsage().rss,
        };
        os.cpuUsage(function(v) {
            s.cpu = v;
            res(s);
        });
    });
}

setInterval(() => {
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