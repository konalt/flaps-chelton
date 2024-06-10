const colors = {
    red: "e2322f",
    orange: "ea8d2a",
    yellow: "fcde1e",
    green: "84d32a",
    blue: "2fdfe2",
    indigo: "412fe2",
    violet: "b32fe2",
    magenta: "f446d4",
    other0: "e2e8e8",
    other1: "d2d8d8",
    other2: "c2c8c8",
    other3: "b2b8b8",
    other4: "a2a8a8",
    other5: "929898",
};
$("#loading").hide();
$("#data").hide();
function readFile(input, cb) {
    let read = 0;
    const files = input.files;
    let res = "";
    if (files[0]) {
        for (const file of files) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    read++;
                    res += "\n" + reader.result;
                    if (read == files.length) {
                        cb(res.trim());
                    }
                },
                false
            );
            reader.readAsText(file);
        }
    }
}

// eslint-disable-next-line no-unused-vars
function attach(type) {
    let sid = $("#serverid").val();
    let e = () => {
        fetch("/api/track_" + type + "/" + sid)
            .then((r) => r.text())
            .then((r) => {
                init(r);
            });
    };
    setInterval(e, 500);
    e();
}

let userColors = {};
let savedUserColors = {
    ".simpleton.": "#2ecc71",
    alternateolympus: "#3498db",
    flaps: "#11806a",
    fuzno: "#fd831a",
    gruonk: "#f32bf6",
    twistysoup: "#8b6bdd",
    woodpigeon: "#e74242",
};
if (localStorage.getItem("track_saved_usercolors")) {
    savedUserColors = JSON.parse(
        localStorage.getItem("track_saved_usercolors")
    );
}
function getUserColor(user) {
    if (savedUserColors[user]) return savedUserColors[user];
    if (!userColors[user])
        userColors[user] =
            "#" + Object.values(colors)[Object.keys(userColors).length];
    return userColors[user];
}

$("#trackfile").change((e) => {
    e.preventDefault();
    readFile($("#trackfile")[0], (data) => {
        console.log(data);
        init(data);
    });
});

function piechart(users) {
    let canvas = document.getElementById("piechart");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let a = -Math.PI / 2;
    let fr = Math.PI * 2;
    let totalMessages = 0;
    for (const user of users) {
        totalMessages += user[1];
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, w);
    for (const user of users) {
        ctx.fillStyle = getUserColor(user[0]);
        ctx.beginPath();
        ctx.moveTo(w / 2, w / 2);
        ctx.arc(w / 2, w / 2, w / 2, a, a + (user[1] / totalMessages) * fr);
        ctx.closePath();
        ctx.fill();
        a += (user[1] / totalMessages) * fr;
    }
    piechartLegend(users, totalMessages);
}

function piechartLegend(users, totalMessages) {
    let canvas = document.getElementById("piechart_legend");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");
    let [w, h] = [canvas.width, canvas.height];
    let i = 0;
    let gap = 10;
    let sq = 20;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "14px sans-serif";
    ctx.textBaseline = "middle";
    for (const user of users) {
        ctx.fillStyle = getUserColor(user[0]);
        ctx.fillRect(gap, gap + (sq + gap) * i, sq, sq);
        ctx.fillStyle = "black";
        ctx.fillText(
            user[0] +
                " (" +
                user[1] +
                ") (" +
                Math.round((user[1] / totalMessages) * 100) +
                "%)",
            gap + sq + 4,
            gap + (sq + gap) * i + sq / 2,
            w - (gap + sq + 4 + 4)
        );
        i++;
    }
}

function textInfo(startTimestamp, endTimestamp, totalMessages, users) {
    let canvas = document.getElementById("textinfo");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");
    let [w, h] = [canvas.width, canvas.height];
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "14px sans-serif";
    ctx.textBaseline = "top";
    let text = "";
    text += "Flaps Track File\n";
    text += `${totalMessages} total messages by ${users.length} users\n`;
    let dateString = (ts) => {
        let d = new Date(ts);
        let x = (n) => {
            return n.toString().padStart(2, "0");
        };
        return `${x(d.getDate())}/${x(d.getMonth() + 1)}/${d.getFullYear()} ${x(
            d.getHours()
        )}:${x(d.getMinutes())}:${x(d.getSeconds())}`;
    };
    text += `Range start: ${dateString(startTimestamp)}\n`;
    text += `Range end: ${dateString(endTimestamp)}\n`;
    ctx.fillStyle = "black";
    let y = 5;
    for (const line of text.trim().split("\n")) {
        ctx.fillText(line, 5, y, w - 10);
        let measure = ctx.measureText(line);
        y +=
            measure.actualBoundingBoxAscent +
            measure.actualBoundingBoxDescent +
            2;
    }
}

function keywordPiechart(messages, keywordMask) {
    let userCounts = {};
    for (const msg of messages) {
        if ((msg.kw & keywordMask) == keywordMask) {
            if (!userCounts[msg.us]) userCounts[msg.us] = 0;
            userCounts[msg.us]++;
        }
    }
    userCounts = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
    let canvas = document.getElementById("kw_piechart");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let a = -Math.PI / 2;
    let fr = Math.PI * 2;
    let totalMessages = 0;
    for (const uc of userCounts) {
        totalMessages += uc[1];
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, w);
    for (const uc of userCounts) {
        ctx.fillStyle = getUserColor(uc[0]);
        ctx.beginPath();
        ctx.moveTo(w / 2, w / 2);
        ctx.arc(w / 2, w / 2, w / 2, a, a + (uc[1] / totalMessages) * fr);
        ctx.closePath();
        ctx.fill();
        a += (uc[1] / totalMessages) * fr;
    }
    keywordPiechartLegend(userCounts, totalMessages, keywordMask, messages);
}

function keywordPiechartLegend(userCounts, totalMessages, kwMask, messages) {
    let canvas = document.getElementById("kw_piechart_legend");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");
    let [w, h] = [canvas.width, canvas.height];
    let i = 0;
    let gap = 10;
    let sq = 20;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "black";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    let kw = Object.entries(keywords).find((kw) => kw[1][0] == kwMask)[0];
    ctx.fillText(kw, w / 2, 8, w);
    ctx.textBaseline = "alphabetic";
    let nextKw = Object.entries(keywords).find((kw) => kw[1][0] == kwMask << 1);
    if (!nextKw) nextKw = Object.entries(keywords).find((kw) => kw[1][0] == 1);
    ctx.fillText("Click to select " + nextKw[0], w / 2, h - 8, w);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (const user of userCounts) {
        ctx.fillStyle = getUserColor(user[0]);
        ctx.fillRect(gap, gap + (sq + gap) * (i + 0.75), sq, sq);
        ctx.fillStyle = "black";
        ctx.fillText(
            user[0] +
                " (" +
                user[1] +
                ") (" +
                Math.round((user[1] / totalMessages) * 100) +
                "%)",
            gap + sq + 4,
            gap + (sq + gap) * (i + 0.75) + sq / 2,
            w - (gap + sq + 4 + 4)
        );
        i++;
    }
    let e = () => {
        keywordPiechart(messages, nextKw[1][0]);
        currentKeyword = nextKw[1][0];
        document
            .getElementById("kw_piechart_legend")
            .removeEventListener("mousedown", e);
    };
    document
        .getElementById("kw_piechart_legend")
        .addEventListener("mousedown", e);
}

let keywords = { None: [0b1, ["none"]] };
let currentKeyword = 1;

function init(log, overrideStart, overrideEnd = 1) {
    let start = Date.now();
    $("#loading").show();
    let messages = [];
    let userStatusChains = {};
    let startTimestamp = overrideStart;
    let endTimestamp = overrideEnd;
    for (const line of log.split("\n").map((n) => n.trim().split(":"))) {
        switch (line[0]) {
            case "META": {
                switch (line[1]) {
                    case "KW": {
                        keywords = {};
                        let i = 0;
                        for (const [key, words] of line
                            .slice(2)
                            .join(":")
                            .split(",")
                            .map((n) => n.split(":"))) {
                            let wordsArray = words.split("/");
                            keywords[key] = [1 << i, wordsArray];
                            i++;
                        }
                        console.log(keywords);
                        break;
                    }
                    case "START_TS": {
                        startTimestamp = Math.min(
                            startTimestamp,
                            parseInt(line[2])
                        );
                    }
                }
                break;
            }
            case "STATES": {
                userStatusChains = {};
                for (let [user, status] of line
                    .slice(1)
                    .join(":")
                    .split(",")
                    .map((n) => n.split(":"))) {
                    if (user == "flaps chelton") user = "flaps";
                    userStatusChains[user] = [[status, 0]];
                }
                break;
            }
            case "STATE": {
                if (!userStatusChains[line[1]])
                    userStatusChains[line[1]] = [["nodata", 0]];
                let tm = parseInt(line[3]);
                userStatusChains[line[1]].push([line[2], tm - startTimestamp]);
                if (!startTimestamp) startTimestamp = tm;
                startTimestamp = Math.min(startTimestamp, tm);
                endTimestamp = Math.max(endTimestamp, tm);
                break;
            }
            default: {
                let msg = {
                    ch: line[0],
                    us: line[1],
                    tm: parseInt(line[2]),
                    kw: line.length > 3 ? parseInt(line[3]) : 0,
                };
                messages.push(msg);
                if (!startTimestamp) startTimestamp = msg.tm;
                startTimestamp = Math.min(startTimestamp, msg.tm);
                endTimestamp = Math.max(endTimestamp, msg.tm);
                break;
            }
        }
    }
    let users = [];
    for (const msg of messages) {
        if (!users.find((u) => u[0] == msg.us)) {
            users.push([msg.us, 1]);
        } else {
            users.find((u) => u[0] == msg.us)[1]++;
        }
    }
    users = users.sort((a, b) => b[1] - a[1]);
    piechart(users);
    keywordPiechart(messages, currentKeyword);
    let tsRange = endTimestamp - startTimestamp;
    let totalMessages = 0;
    for (const user of users) {
        totalMessages += user[1];
    }
    textInfo(startTimestamp, endTimestamp, totalMessages, users);
    users = users.map((u) => u[0]);
    let canvas = document.getElementById("trackout");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");
    let [w, h] = [canvas.width, canvas.height];
    let c = (x, y, r, c) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.rect(x, y, r, inc);
        ctx.closePath();
        ctx.fill();
    };
    let margin = 20;
    let inc = (h - margin) / users.length;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.2;
    let i = 0;
    for (const user of users) {
        let chain = userStatusChains[user];
        let y = margin + i * inc;
        ctx.fillStyle = getUserColor(user);
        let j = 0;
        let x = 0;
        for (const [status, ts] of chain) {
            let timeToNext = 0;
            if (chain[j + 1]) {
                timeToNext = chain[j + 1][1] - ts;
            } else {
                timeToNext = endTimestamp - ts;
            }
            let t = (timeToNext / tsRange) * w;
            if (status != "offline") {
                ctx.fillRect(x, y, t, inc);
            } else if (status == "nodata") {
                ctx.fillStyle = "grey";
                ctx.fillRect(x, y, t, inc);
                ctx.fillStyle = getUserColor(user);
            }
            x += t;
            j++;
        }
        i++;
    }
    console.log(userStatusChains);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#888";
    ctx.strokeStyle = "#888";
    ctx.textAlign = "left";
    ctx.font = "10px sans-serif";
    let count = 12;
    for (let i = 0; i < count; i++) {
        let date = new Date(startTimestamp + (tsRange / (count - 1)) * i);
        let timeStr =
            date.getHours().toString().padStart(2, "0") +
            ":" +
            date.getMinutes().toString().padStart(2, "0");
        ctx.fillText(timeStr, (w / (count - 1)) * i, margin - 5);
        ctx.beginPath();
        ctx.moveTo((w / (count - 1)) * i, margin);
        ctx.lineTo((w / (count - 1)) * i, h);
        ctx.stroke();
        if (i < count - 2) {
            ctx.textAlign = "center";
        } else {
            ctx.textAlign = "right";
        }
    }
    for (const msg of messages) {
        let timeSinceStartTimestamp = msg.tm - startTimestamp;
        let x = (timeSinceStartTimestamp / tsRange) * w;
        let y = margin + users.indexOf(msg.us) * inc;
        let co = getUserColor(msg.us);
        c(x, y, 2, co);
    }
    i = 0;
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "14px sans-serif";
    for (const user of users) {
        ctx.fillText(user, 10, margin + users.indexOf(user) * inc + inc / 2);
        i++;
    }
    $("#loading").hide();
    $("#import").hide();
    $("#data").show();
    let dur = Date.now() - start;
    $("#updatetime").text(dur);
}
