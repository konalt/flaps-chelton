const cp = require("child_process");

var lastNL = true;
var lastLogCount = 20;
var lastLog = [];

function run() {
    console.log(`Starting flaps...`);
    var proc = cp.spawn("node", "dist/index.js".split(" "));
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
        console.log(`Exit with code ${code}`);
        lastLog = [];
        lastNL = true;
        run();
    });
}

run();
