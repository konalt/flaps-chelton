const os = require("os-utils");

var analytics = {
    uptime: 0,
    errors: [],
    messages: [],
    stats: new Array(20),
};

analytics.stats.fill({
    cpu: 0,
    mem: 0,
    time: "N/A",
});

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
    analytics.errors.push(err.stack);
}

function getAnalytics() {
    return analytics;
}

function getStats() {
    return new Promise((res) => {
        var s = {
            cpu: 0,
            mem: process.memoryUsage().heapUsed / 1024 / 1024 / os.totalmem(),
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