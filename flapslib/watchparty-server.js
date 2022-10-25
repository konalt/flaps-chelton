const { sendWebhook, users } = require("./webhooks");
const fetch = require("node-fetch");
const { resolveSoa } = require("dns");
const { getAnalytics } = require("./analytics");
const { make512x512 } = require("./canvas");

function init(client) {
    const fs = require("fs");
    const express = require("express");
    const https = require("https");
    const {
        uuidv4,
        questionPromise,
        dalle2Promise,
        dalle2InpaintPromise,
    } = require("./ai");
    var app_rest = express();

    const options = {
        key: fs.readFileSync("C:/Certbot/live/konalt.us.to-0002/privkey.pem"),
        cert: fs.readFileSync(
            "C:/Certbot/live/konalt.us.to-0002/fullchain.pem"
        ),
    };

    app_rest.use(express.urlencoded({ extended: true }));
    app_rest.use(express.json({ extended: true, limit: "50mb" }));
    app_rest.use((req, res, next) => {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Headers", "*");
        res.set("Server", "FlapsWP");
        res.set("X-Konalt-Request-ID", "Unknown");
        res.set("Connection", "Keep-Alive");
        next();
    });

    var currentWps = {};
    app_rest.post("/start", (req, res) => {
        if (!req.body.videoId)
            return res.send({ id: "FlapsChelton.Error.NoVideoIDProvided" });
        var id = Object.entries(currentWps).length;
        currentWps[id] = {
            videoId: req.body.videoId,
            currentTime: 0,
            startTime: Date.now(),
            queue: [],
            paused: true,
        };
        res.send({
            id: id,
        });
    });
    app_rest.post("/queue/:id", (req, res) => {
        if (!req.body.videoId) return res.send(false);
        if (!currentWps[req.params.id]) return res.send(false);
        currentWps[req.params.id].queue.push(req.body.videoId);
    });
    app_rest.post("/send", (req, res) => {
        sendWebhook(
            "restman",
            req.body.content,
            false,
            client.channels.cache.find((c) => c.name == "dave")
        );
        res.send("done");
    });

    app_rest.get("/wp/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            res.status(404).send({
                videoId: "error",
                currentTime: 0,
                startTime: Date.now(),
                queue: [],
            });
        } else {
            res.send(currentWps[req.params.id]);
        }
    });
    app_rest.get("/wptime/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            res.status(404).send({ currentTime: 0 });
        } else {
            res.send({ currentTime: currentWps[req.params.id].currentTime });
        }
    });
    app_rest.get("/next/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            res.status(404).send({ wentToNext: false, wp: null });
        } else {
            if (currentWps[req.params.id].queue.length == 0)
                return res.send({
                    wentToNext: false,
                    wp: currentWps[req.params.id],
                });
            currentWps[req.params.id].videoId =
                currentWps[req.params.id].queue[0];
            currentWps[req.params.id].currentTime = 0;
            currentWps[req.params.id].startTime = Date.now();
            currentWps[req.params.id].queue =
                currentWps[req.params.id].queue.slice(1);
            res.send({ wentToNext: true, wp: currentWps[req.params.id] });
        }
    });
    app_rest.get("/pause/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            res.status(404).send({ wp: null });
        } else {
            currentWps[req.params.id].paused = !currentWps[req.params.id].paused;
            res.send({ wp: currentWps[req.params.id] });
        }
    });
    app_rest.get("/end/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            res.status(404).send(false);
        } else {
            currentWps[req.params.id] = undefined;
            delete currentWps[req.params.id];
            res.send(true);
        }
    });

    https.createServer(options, app_rest).listen(4930);

    app_rest.post("/message/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            return res.status(404).send(false);
        }
        if (!req.body.content) return res.status(400).send(false);
        chat.push([req.socket.remoteAddress, req.body.content]);
        res.send(true);
    });

    app_rest.get("/flaps_api/funnynumber/:x", (req, res) => {
        var x = req.params.x.split(" ").join("_");
        fetch("https://rule34.xxx/public/autocomplete.php?q=" + x, {
                credentials: "omit",
                headers: {
                    "User-Agent": "FlapsChelton",
                    Accept: "*/*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                },
                referrer: "https://rule34.xxx/",
                method: "GET",
                mode: "cors",
            })
            .then((r) => {
                return r.json();
            })
            .then((r) => {
                res.send(r[0] ? r[0].label : "wowie!! no porn!!!");
            });
    });
    app_rest.get("/flaps_api/analytics", (req, res) => {
        res.contentType("application/json").send(
            JSON.stringify(getAnalytics())
        );
    });
    app_rest.post("/flaps_api/question", (req, res) => {
        if (!req.body.question) {
            return res
                .status(400)
                .contentType("text/plain")
                .send("400 Bad Request");
        }
        questionPromise(req.body.question).then((data) => {
            res.contentType("text/plain").send(data);
        });
    });
    app_rest.post("/flaps_api/inpaint", (req, res) => {
        if (!req.body.prompt || !req.body.mask || !req.body.img) {
            return res
                .status(400)
                .contentType("text/plain")
                .send("400 Bad Request");
        }
        dalle2InpaintPromise(req.body)
            .then((data) => {
                res.contentType("image/png").send(data);
            })
            .catch((err) => {
                res.status(500).contentType("text/plain").send(err);
            });
    });
    app_rest.post("/flaps_api/dalle2", (req, res) => {
        if (!req.body.prompt) {
            return res
                .status(400)
                .contentType("text/plain")
                .send("400 Bad Request");
        }
        dalle2Promise(req.body.prompt)
            .then((data) => {
                res.contentType("image/png").send(data);
            })
            .catch((err) => {
                res.status(500).contentType("text/plain").send(err);
            });
    });
    app_rest.get("/flaps_api/userdata/:x", (req, res) => {
        var user = req.params.x;
        if (user.startsWith("<")) user = user.substring(1);
        if (users[user]) {
            res.send(
                users[user][0] == "__FlapsNick__" ?
                "flaps chelton" :
                users[user][0]
            );
        } else {
            res.send("FlapsAPIUnknownUser");
        }
    });
    app_rest.get("/bigfile/:name", (req, res) => {
        try {
            if (
                fs.existsSync(
                    "E:/MBG/2Site/sites/konalt/flaps/bigfile/" + req.params.name
                )
            ) {
                res.sendFile(
                    "E:/MBG/2Site/sites/konalt/flaps/bigfile/" + req.params.name
                );
            } else {
                res.status(404).send("404 File Not Found");
            }
        } catch (e) {
            addError(e);
            res.status(500).send(
                "500 Internal Server Error\nStack Trace:" + e.toString()
            );
        }
    });
    app_rest.get("/flaps_api/userdata_json/:x/:y", (req, res) => {
        var user = req.params.x;
        if (user.startsWith("<")) user = user.substring(1);
        if (users[user]) {
            res.send({
                name: users[user][0] == "__FlapsNick__" ?
                    "flaps chelton" :
                    users[user][0],
                text: req.params.y.replace(/\.space\./g, " "),
            });
        } else {
            res.send({
                name: "FlapsAPIUnknownUser",
                text: req.params.y.replace(/\.space\./g, " "),
            });
        }
    });

    setInterval(() => {
        Object.entries(currentWps).forEach((wp) => {
            if (!wp[1].paused) wp[1].currentTime += 500;
        });
    }, 500);

    console.log("WatchParty: server listening");
}

module.exports = init;