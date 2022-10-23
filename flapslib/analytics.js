const os = require("os-utils");

var analytics = {
    startTime: Date.now(),
    errors: [],
    messages: [],
    stats: [],
};

function addMessage(msg) {
    analytics.messages.push(msg);
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
            mem: 0,
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