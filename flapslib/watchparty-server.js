const { sendWebhook } = require("./webhooks");

function init(client) {
    const fs = require("fs");
    const express = require("express");
    const https = require("https");
    const { uuidv4 } = require("./ai");
    var app_rest = express();

    const options = {
        key: fs.readFileSync("C:/Certbot/live/konalt.us.to-0002/privkey.pem"),
        cert: fs.readFileSync("C:/Certbot/live/konalt.us.to-0002/fullchain.pem")
    };

    app_rest.use(express.urlencoded({ extended: true }));
    app_rest.use(express.json({ extended: true }));
    app_rest.use((req, res, next) => {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Server", "FlapsWP");
        res.set("X-Konalt-Request-ID", "Unknown");
        res.set("Connection", "Keep-Alive")
        next();
    });

    var currentWps = {};

    app_rest.post("/start", (req, res) => {
        if (!req.body.videoId) return res.send({ id: "FlapsChelton.Error.NoVideoIDProvided" });
        var id = uuidv4().toUpperCase().replace(/-/gi, "_");
        currentWps[id] = {
            videoId: req.body.videoId,
            currentTime: 0,
            startTime: Date.now(),
            queue: []
        };
        res.send({
            id: id
        });
    });
    app_rest.post("/queue/:id", (req, res) => {
        if (!req.body.videoId) return res.send(false);
        if (!currentWps[req.params.id]) return res.send(false);
        currentWps[req.params.id].queue.push(req.body.videoId);
    });
    app_rest.post("/send", (req, res) => {
        sendWebhook("restman", req.body.content, false, client.channels.cache.find(c => c.name == "gruk-cave-wall"));
        res.send("done");
    });

    app_rest.get("/wp/:id", (req, res) => {
        if (!currentWps[req.params.id]) {
            res.status(404).send({
                videoId: "error",
                currentTime: 0,
                startTime: Date.now(),
                queue: []
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
            if (currentWps[req.params.id].queue.length == 0) return res.send({ wentToNext: false, wp: currentWps[req.params.id] });
            currentWps[req.params.id].videoId = currentWps[req.params.id].queue[0];
            currentWps[req.params.id].currentTime = 0;
            currentWps[req.params.id].startTime = Date.now();
            currentWps[req.params.id].queue = currentWps[req.params.id].queue.slice(1);
            res.send({ wentToNext: true, wp: currentWps[req.params.id] });
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

    setInterval(() => {
        Object.entries(currentWps).forEach(wp => {
            wp[1].currentTime = Date.now() - wp[1].startTime;
        });
    }, 1000);

    console.log("WatchParty: server listening");
}

module.exports = init;