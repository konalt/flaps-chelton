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
    const file = input.files[0];
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            cb(reader.result);
        },
        false
    );
    if (file) {
        reader.readAsText(file);
    }
}

$("#trackfile").change((e) => {
    e.preventDefault();
    readFile($("#trackfile")[0], (data) => {
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
    let i = 0;
    for (const user of users) {
        ctx.fillStyle = "#" + Object.values(colors)[i];
        ctx.beginPath();
        ctx.moveTo(w / 2, w / 2);
        ctx.arc(w / 2, w / 2, w / 2, a, a + (user[1] / totalMessages) * fr);
        ctx.closePath();
        ctx.fill();
        a += (user[1] / totalMessages) * fr;
        i++;
    }
    piechartLegend(users, totalMessages);
}

function piechartLegend(users, totalMessages) {
    console.log(totalMessages);
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
        ctx.fillStyle = "#" + Object.values(colors)[i];
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

function init(log, overrideStart, overrideEnd = 1) {
    $("#loading").show();
    let messages = log
        .split("\n")
        .map((n) => n.trim().split(":"))
        .map((m) => {
            return { ch: m[0], us: m[1], tm: parseInt(m[2]) };
        });
    let users = [];
    let startTimestamp = overrideStart;
    let endTimestamp = overrideEnd;
    for (const msg of messages) {
        if (!users.find((u) => u[0] == msg.us)) {
            users.push([msg.us, 1]);
        } else {
            users.find((u) => u[0] == msg.us)[1]++;
        }
        if (!startTimestamp) startTimestamp = msg.tm;
        startTimestamp = Math.min(startTimestamp, msg.tm);
        endTimestamp = Math.max(endTimestamp, msg.tm);
    }
    users = users.sort((a, b) => b[1] - a[1]);
    piechart(users);
    users = users.map((u) => u[0]);
    let tsRange = endTimestamp - startTimestamp;
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
    let inc = (h - margin * 2) / users.length;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.2;
    let i = 0;
    for (const _ of users) {
        let y = margin + i * inc;
        ctx.fillStyle = "#" + Object.values(colors)[i];
        ctx.fillRect(0, y, w, inc);
        i++;
    }
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
        let co = "#" + Object.values(colors)[users.indexOf(msg.us)];
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
}
