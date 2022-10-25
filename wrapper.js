const cp = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");

var lastNL = true;
var lastLogCount = 20;
var lastLog = [];

function run() {
    console.log("[flaps-watchdog] starting flaps");
    var proc = cp.spawn("node", "main.js".split(" "));
    proc.stdout.on("data", (data) => {
        process.stdout.write(data);
        lastNL = data.toString().endsWith("\n");
        if (lastLog.length == lastLogCount) lastLog.shift();
        lastLog.push(data.toString());
    });
    proc.stderr.on("data", (data) => {
        process.stdout.write((lastNL ? "[ERR] " : "") + data);
        lastNL = data.toString().endsWith("\n");
        if (lastLog.length == lastLogCount) lastLog.shift();
        lastLog.push(data.toString());
    });
    proc.on("close", (code) => {
        console.log("[flaps-watchdog] flaps exited with code " + code);
        sendError();
        lastLog = [];
        lastNL = true;
        run();
    });
}

function sendError() {
    var url = fs.readFileSync("./errorhook.txt").toString();
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            content: `[flaps-watchdog] Flaps has crashed, fucking hell.\nLast ${lastLogCount} chunks of log:\`\`\`${lastLog.join(
                ""
            )}\`\`\`\nI've gone and restarted him for you, you lazy cunts.`,
            avatar_url: "https://media.discordapp.net/attachments/882743320554643476/966053990427156650/unknown.png",
            username: "CHELTON FUCKING CRASHED",
        }),
        headers: { "Content-Type": "application/json" },
    });
}

run();