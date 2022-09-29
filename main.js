//#region Require shit
const Discord = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");
const canvas = require("canvas");
const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});
const versus = require("./versus/run");
const flapslib = require("./flapslib/index");
const WomboDreamApi = require("wombo-dream-api");
//! FIX THIS!!!!!!
const { getVideoDurationInSeconds } = require("get-video-duration");
const prism = require("prism-media");
const {
    NoSubscriberBehavior,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    entersState,
    VoiceConnectionStatus,
    joinVoiceChannel,
    generateDependencyReport,
} = require("@discordjs/voice");
const download = require("./flapslib/download");
const {
    uuidv4,
    question,
    switchMode,
    gpt3complete,
    elcomplete,
    monsoonChatEvent,
    setSanity,
    describe,
    questionImage,
    questionFree,
    sendToChatbot,
    ruQuestion,
} = require("./flapslib/ai");
const {
    sendWebhook,
    editWebhookMsg,
    sendWebhookFile,
    users,
    sendWebhookButton,
} = require("./flapslib/webhooks");
const { cahWhiteCard } = require("./flapslib/cardsagainsthumanity");
const { loadImage } = require("canvas");
const { Image } = require("canvas");
const {
    laugh,
    homodog,
    flip,
    sb,
    frame,
    weezer,
    carbs,
    watermark,
    animethink,
    dalle2watermark,
    frame2,
    unfunnyTest,
    animethink2,
    spotted,
} = require("./flapslib/canvas");
const { createCanvas } = require("canvas");
const { Canvas } = require("canvas");
const { AudioPlayerStatus } = require("@discordjs/voice");
const { doTranslate, doTranslateSending } = require("./flapslib/translator");
const { randomRedditImage } = require("./flapslib/fetchapis");
const { OpenAIApi } = require("openai");
const { Configuration } = require("openai");
const { compress } = require("./flapslib/videowrapper");
const owoify = require("owoify-js").default;
var dream = WomboDreamApi.buildDefaultInstance();

flapslib.webhooks.setClient(client);
flapslib.fetchapis.setClient(client);

var players = [
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
    createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
            maxMissedFrames: Math.round(5000 / 20),
        },
    }),
];

players.forEach((ply, i) => {
    var index = parseInt(i.toString()); // dooplication
    ply.on("stateChange", (oldState, newState) => {
        if (loopingPlayers.includes(index)) {
            if (oldState.status == "playing" && newState.status == "idle") {
                console.log("LOOPIG HAHAH");
                //attachRecorder(index, curPlayerTracks[index]);
            }
        }
    });
});

var loopingPlayers = [];
var curPlayerTracks = [];

function attachRecorder(player, file, loop = false) {
    if (!file) return;
    players[player].play(
        createAudioResource(
            new prism.FFmpeg({
                args: [
                    "-analyzeduration",
                    "0",
                    "-loglevel",
                    "0",
                    "-i",
                    "./audio/" +
                    file +
                    (file.endsWith(".mp4") ? ".mp4" : ".mp3"),
                    "-acodec",
                    "libopus",
                    "-f",
                    "opus",
                    "-ar",
                    "48000",
                    "-ac",
                    "2",
                ],
            }), {
                inputType: StreamType.OggOpus,
            }
        )
    );
    curPlayerTracks[player] = file;
}

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        nbsp: " ",
        amp: "&",
        quot: '"',
        lt: "<",
        gt: ">",
    };
    return encodedString
        .replace(translate_re, function(match, entity) {
            return translate[entity];
        })
        .replace(/&#(\d+);/gi, function(match, numStr) {
            var num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
}

function getR34Comments(postId) {
    return new Promise((res, rej) => {
        if (!postId) return res("[No comments on this post]");
        fetch("https://rule34.xxx/index.php?page=post&s=view&id=" + postId)
            .then((r) => r.text())
            .then((r) => {
                var comments = r
                    .split('<div id="comment-list">')[1]
                    .split('<div class="col2">')
                    .slice(1)
                    .map((c) => {
                        return decodeEntities(c.trim().split("\n")[0]);
                    })
                    .filter((c) => {
                        return !c.includes("~");
                    })
                    .join("\n");
                if (!comments) return res("[No comments on this post]");
                res(comments);
            });
    });
}

/**
 * @type {Canvas[]}
 */
var canvases = [];

async function connectToChannel(channels) {
    var connections = [];
    var ret = [];
    channels.forEach((c) => {
        connections.push(
            joinVoiceChannel({
                channelId: c.id,
                guildId: c.guild.id,
                adapterCreator: c.guild.voiceAdapterCreator,
            })
        );
    });
    connections.forEach((c) => {
        try {
            entersState(c, VoiceConnectionStatus.Ready, 30000);
            ret.push(c);
        } catch (error) {
            c.destroy();
            throw error;
        }
    });
    return ret;
}
var words = fs
    .readFileSync("./flags.txt")
    .toString()
    .split("\r\n")
    .map((x) => {
        return [x.split(" ")[0], x.split(" ").slice(1).join(" ")];
    });

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
var swears = ["fucking", "shit", "motherfucking", "shitty", "fuck"];

var lastRequests = {};
//#endregion

var serverVCs = {
    "910525327585992734": "910525328055762994",
    "760524739239477340": "874341836796362752",
};

canvas.registerFont("homodog.otf", { family: "Homodog" });
canvas.registerFont("weezer.otf", { family: "Weezer" });
canvas.registerFont("futura.otf", { family: "Futura", weight: 400 });

var errChannel;

client.on("ready", async() => {
    console.log(`Logged in as ${client.user.tag}`);

    const connections = await connectToChannel(
        Object.values(serverVCs).map((x) => {
            return client.channels.cache.get(x);
        })
    );
    connections[0].subscribe(players[0]);
    connections[1].subscribe(players[1]);

    errChannel = await client.channels.fetch("882743320554643476");

    players.forEach((player) => {
        player.on("error", (err) => {
            try {
                sendWebhook("flapserrors", err, false, errChannel);
            } catch {
                console.log("ERAR ! !", err);
            }
        });
    });

    connections.forEach((con) => {
        con.on("error", (err) => {
            try {
                sendWebhook("flapserrors", err, false, errChannel);
            } catch {
                console.log("ERAR ! !", err);
            }
        });
    });

    fs.readFile("./saved_status.txt", (_err, data) => {
        data = data.toString();
        console.log(data);
        var type = data.split(" ")[0].toUpperCase();
        var name = data.split(" ").slice(1).join(" ");
        client.user.setPresence({
            activities: [{
                name: name,
                type: type,
                url: "https://konalt.us.to",
                timestamps: {
                    start: Date.now(),
                },
            }, ],
            afk: false,
            status: "online",
        });
    });
});

Error.stackTraceLimit = 50;

var commands = {
    "<": "Sends a message as a webhook user. Get a list with !userlist",
    "!restart": "shoots flaps in the back of the head",
    "!eval": "runs javascripe",
    "!audio": "plays audio in your server vc",
    "!watchparty": "starts a watch party so you can watch youtube with frends!!!1",
    "!wpadd": "adds a video to the watch party queue",
    "!status": "changes flap statussy",
    "!yturl": "plays youtube video in voice chat",
    "!ytsearch": "searches then plays video in voice chat",
    "!markov": "use a markov chain text generator. produces silly results.",
    "!armstrong": "CALL AN AMBULANCE JACK, I'M HAVING AN ARMSTROKE",
    "!ytmp3": "downloads youtube video to mp3",
    "!gif": "creates a raiden punching armstrong gif",
    "!imageaudio": "turns an image into a video with audio",
    "!geq": "runs a geq on each pixel of a video. [info here](https://ffmpeg.org/ffmpeg-filters.html#geq)",
    "!caption": "captions a video.",
    "!aigen": "uses an ai to generate an image.",
    "!<:owl:964880176355897374>": "<:owl:964880176355897374>",
    "!3dtext": "generates some 3d text. you can add an image.",
    "!framephoto": "frames a photo.",
    "!speechbubble": "adds a speech bubble to an image. do !speechbubbleflip to flip it.",
    "!flip": "flips ~~chilton~~ an image horizontally",
    "!laugh": "captions an image. do !laugh attachment for an attachment. a list is in flaps/images/sizes.txt",
    "!person": "uses world class techmonoligies to generate a face.",
    "!complete": "uses world class techmonamologies to autocomplete some text.",
    "!basedmeter": "based meter",
    "!degeneracy": "gets a random post from either /b/, /r9k/, /s4s/ or /vip/. nsfw very possible.",
    "!flapslength": "size matters",
    "!petit": "gets a random youtube video with no views from petittube.com. its not a porn site, jack.",
    "!<:armstrong:962346935795208217>": "does nothing",
    "!help": "shows this",
    "!balkancuisine": "sends an image of balkan cuisine",
    "!morbius": "morbius review from metacritic",
};

var descriptions = {
    "489894082500493349": "a cold blooded killer, ready to strike whenever newports are on the line\nhttps://media.discordapp.net/attachments/910525327585992737/980522490856095825/4.PNG",
    "445968175381610496": 'the creator of "Flaps Chelton", which is a discord bot designed to facilitate illegal activity.\nhttps://media.discordapp.net/attachments/910525327585992737/980524110952157254/unknown.png',
    "794301103721414676": "SCP-1222 - Description: horny little runcling. really loves <:nice:979045005345849375>\nhttps://media.discordapp.net/attachments/910525327585992737/980522446572650617/unknown.png",
    "976471678429311086": "'yeah i still would tho' 'agreed'\nhttps://media.discordapp.net/attachments/910525327585992737/980522944201629736/unknown.png",
    "775778497707769927": "el polozhenie\nhttps://media.discordapp.net/attachments/910525327585992737/980523248120889344/unknown.png",
    "741701565907206267": "Loves to make [[DEALS]]\nhttps://media.discordapp.net/attachments/910525327585992737/980524568416493668/unknown.png",
    "547476998071517195": "we couldnt find a photo for this guy. we went to mcdonalds instead\nhttps://media.discordapp.net/attachments/910525327585992737/980523453042028574/mcdondil.PNG",
};

var used = [];

var userStickies = {};

async function scalFunnyVideo(msg) {
    var files = fs.readdirSync("E:/MBG/the Videos/");
    var chosenFile = files[Math.floor(Math.random() * files.length)];
    var filesize =
        fs.statSync("E:/MBG/the Videos/" + chosenFile).size / (1024 * 1024);
    if (filesize > 8) {
        sendWebhookButton(
            "scal",
            "mm.. too big. its " +
            Math.round(filesize) +
            " inche-- i mean megabytes. megabytes.", [{
                type: 1,
                label: "get another",
                id: "scal_video_tryagain",
                cb: (i) => {
                    scalFunnyVideo(i.message);
                },
                disableAfter: true,
            }, ],
            msg.channel
        );
    } else {
        var message = await client.channels.cache
            .get("956316856422137856")
            .send({
                files: [{
                    attachment: "E:/MBG/the Videos/" + chosenFile,
                }, ],
            });

        sendWebhookButton(
            "scal",
            message.attachments.first().url, [{
                type: 2,
                style: 1,
                label: "get another",
                id: "scal_video_tryagain",
                cb: (i) => {
                    scalFunnyVideo(i.message);
                },
                disableAfter: true,
            }, ],
            msg.channel
        );
    }
}

function getStoredFunnyNumber(id) {
    var strData = fs.readFileSync("stored_funnynumbers.txt").toString();
    var obj = {};
    strData.split("\n").forEach((data) => {
        var line = data.split(" ");
        obj[line[0]] = parseInt(line[1]);
    });
    return obj[id];
}

function getStoredFunnyNumberData() {
    var strData = fs.readFileSync("stored_funnynumbers.txt").toString();
    var obj = {};
    strData.split("\n").forEach((data) => {
        var line = data.split(" ");
        obj[line[0]] = parseInt(line[1]);
    });
    return obj;
}

function storeFunnyNumberData(obj) {
    var strData = "";
    var obj2 = Object.assign(obj, getStoredFunnyNumberData());
    Object.entries(obj2).forEach((data) => {
        strData += `${data[0]} ${data[1]}\n`;
    });
    fs.writeFileSync("stored_funnynumbers.txt", strData.trim());
}

function getComparisonEmoji(a, b) {
    if (typeof a === "undefined" || typeof b === "undefined") return "❓";
    if (a > b) return "⬆️";
    if (a < b) return "⬇️";
    return "⏸️";
}

/**
 *
 * @param {Discord.Message} msg
 * @returns
 */
async function onMessage(msg) {
    try {
        console.log(
            `${msg.author.username}#${msg.author.discriminator}: ${msg.content}`
        );
        if (msg.content.includes("copper") && !msg.author.bot) {
            msg.channel.send("copper you say?");
        }
        if (!msg.content.startsWith("<")) {
            words = fs
                .readFileSync("./flags.txt")
                .toString()
                .split("\r\n")
                .map((x) => {
                    return [x.split(" ")[0], x.split(" ").slice(1).join(" ")];
                });
            var messageFlags = [];
            words.forEach((word) => {
                if (
                    (msg.content.toLowerCase().includes(word[1]) ||
                        msg.author.username.toLowerCase().includes(word[1])) &&
                    !messageFlags.includes(word[0])
                ) {
                    messageFlags.push(word[0]);
                }
            });
            if (messageFlags.includes("rember")) {
                messageFlags = messageFlags.filter((x) => x != "forgor");
            }
            if (messageFlags.includes("political"))
                msg.react(
                    client.emojis.cache.find(
                        (emoji) => emoji.name === "political"
                    )
                );
            if (messageFlags.includes("forgor")) msg.react("💀");
            if (messageFlags.includes("rember")) msg.react("😁");
            if (messageFlags.includes("trans")) msg.react("🏳️‍⚧️");
            if (messageFlags.includes("literally"))
                msg.react(
                    client.emojis.cache.find(
                        (emoji) => emoji.name === "literally1984"
                    )
                );
            if (messageFlags.includes("bone"))
                msg.react(
                    client.emojis.cache.find(
                        (emoji) => emoji.name === "BAD_TO_THE_BONE"
                    )
                );
            if (messageFlags.includes("selfie")) {
                if (Math.random() > 0.5) {
                    msg.react("👍");
                } else {
                    msg.react("👎");
                }
            }
            if (messageFlags.includes("hello"))
                msg.react(
                    client.emojis.cache.find(
                        (emoji) => emoji.name === "828274359076126760"
                    )
                );
        }
        var commandArgs = msg.content.split(" ");
        var commandArgString = commandArgs.slice(1).join(" ");
        var command = commandArgs[0].toLowerCase();
        var toDelete = false;
        if (command == "!ad") {
            toDelete = true;
            commandArgs.shift();
            command = commandArgs[0].toLowerCase();
            if (!command.startsWith("!")) {
                toDelete = false;
                setTimeout(() => {
                    return msg.delete();
                }, 1500);
            }
        }
        if (userStickies[msg.author.id]) {
            if (msg.content.startsWith("!..unsticky")) {
                return (userStickies[msg.author.id] = false);
            }
            msg.delete();
            return sendWebhook(
                userStickies[msg.author.id],
                msg.content,
                false,
                msg.channel
            );
        }
        var scal = msg.content.toLowerCase();
        if (scal.includes("funny") && scal.includes("video")) {
            return scalFunnyVideo(msg);
        }
        if (
            scal.includes("scal") &&
            scal.includes("<:cookie:1006706770309292042>")
        ) {
            fs.writeFileSync("scal_allowtime.txt", "yes");
            return sendWebhook(
                "scal",
                "thank you for your offering. i really love this. i will now announce the next funny time",
                false,
                msg.channel
            );
        }
        if (msg.content.startsWith("!..sticky")) {
            var stickyBot = commandArgs[1];
            flapslib.webhooks.updateUsers();
            if (flapslib.webhooks.users[stickyBot]) {
                userStickies[msg.author.id] = stickyBot;
                sendWebhook(
                    "flaps",
                    stickyBot +
                    " is now your sticky. use !..unsticky to go back to normal",
                    false,
                    msg.channel
                );
            } else {
                sendWebhook(
                    "flaps",
                    "FLAPS CHELTON VIOLATION OF PRIVACY IN WOMAN BATHROOMS!!!!!",
                    false,
                    msg.channel
                );
            }
        } else if (msg.content.startsWith(">")) {
            var content = `${msg.content}`;
            if (msg.reference) {
                editWebhookMsg(
                    msg.reference.messageId,
                    msg.channel,
                    content.substring(1)
                );
                msg.delete();
            }
        } else if (msg.content.startsWith("<")) {
            var content = `${msg.content}`;
            flapslib.webhooks.updateUsers();
            if (commandArgs[0].substring(1) == "all") {
                Object.keys(flapslib.webhooks.users).forEach((user, index) => {
                    setTimeout(() => {
                        flapslib.webhooks
                            .sendWebhook(
                                user,
                                content.substring(
                                    content.split(" ")[0].length + 1
                                ),
                                false,
                                msg.channel
                            )
                            .then((r) => {
                                if (r == "ALL_WAIT") {
                                    setTimeout(() => {
                                        flapslib.webhooks
                                            .sendWebhook(
                                                user,
                                                content.substring(
                                                    content.split(" ")[0]
                                                    .length + 1
                                                ),
                                                false,
                                                msg.channel
                                            )
                                            .then();
                                    }, 4000);
                                }
                            });
                    }, index * 1500);
                });
                msg.delete();
                return;
            } else if (commandArgs[0].substring(1) == "random") {
                var user = Object.keys(flapslib.webhooks.users)[
                    Math.floor(
                        Math.random() *
                        Object.keys(flapslib.webhooks.users).length
                    )
                ];
                flapslib.webhooks
                    .sendWebhook(
                        user,
                        content.substring(content.split(" ")[0].length + 1),
                        false,
                        msg.channel
                    )
                    .then((r) => {
                        if (r == "ALL_WAIT") {
                            setTimeout(() => {
                                flapslib.webhooks
                                    .sendWebhook(
                                        user,
                                        content.substring(
                                            content.split(" ")[0].length + 1
                                        ),
                                        false,
                                        msg.channel
                                    )
                                    .then();
                            }, 4000);
                        }
                    });
                msg.delete();
                return;
            } else if (commandArgs[0].substring(1) == "custom") {
                console.log(
                    msg.content.includes("--u") &&
                    msg.content.includes("--c") &&
                    msg.content.includes("--a")
                );
                if (!(
                        msg.content.includes("--u") &&
                        msg.content.includes("--c") &&
                        msg.content.includes("--a")
                    )) {
                    flapslib.webhooks.sendWebhook(
                        "flaps",
                        "custom must have --u, --c and --a",
                        false,
                        msg.channel
                    );
                    return;
                }
                flapslib.webhooks
                    .sendWebhook(
                        "custom",
                        content.substring(content.split(" ")[0].length + 1),
                        false,
                        msg.channel, {
                            content: content
                                .split(" ")
                                .slice(
                                    content.split(" ").indexOf("--c") + 1,
                                    (function() {
                                        var r = 0;
                                        content
                                            .split(" ")
                                            .forEach((el, index) => {
                                                if (
                                                    index >
                                                    content
                                                    .split(" ")
                                                    .indexOf("--c") &&
                                                    el.startsWith("--")
                                                ) {
                                                    r = index - 2;
                                                }
                                            });
                                        if (r == 0) {
                                            r = content.split(" ").length;
                                        }
                                        return r;
                                    })()
                                )
                                .join(" "),
                            avatar: content
                                .split(" ")
                                .slice(
                                    content.split(" ").indexOf("--a") + 1,
                                    (function() {
                                        var r = 0;
                                        content
                                            .split(" ")
                                            .forEach((el, index) => {
                                                if (
                                                    index >
                                                    content
                                                    .split(" ")
                                                    .indexOf("--a") &&
                                                    el.startsWith("--")
                                                ) {
                                                    r = index;
                                                }
                                            });
                                        if (r == 0) {
                                            r = content.split(" ").length;
                                        }
                                        return r;
                                    })()
                                )
                                .join(" "),
                            username: content
                                .split(" ")
                                .slice(
                                    content.split(" ").indexOf("--u") + 1,
                                    (function() {
                                        var r = 0;
                                        content
                                            .split(" ")
                                            .forEach((el, index) => {
                                                if (
                                                    index >
                                                    content
                                                    .split(" ")
                                                    .indexOf("--u") &&
                                                    el.startsWith("--")
                                                ) {
                                                    r = index;
                                                }
                                            });
                                        if (r == 0) {
                                            r = content.split(" ").length;
                                        }
                                        return r;
                                    })()
                                )
                                .join(" "),
                        },
                        msg
                    )
                    .then();
                msg.delete();
                return;
            }
            if (!Object.keys(flapslib.webhooks.users).includes(
                    commandArgs[0].substring(1)
                ))
                return;
            flapslib.webhooks
                .sendWebhook(
                    commandArgs[0].substring(1),
                    msg.content.substring(commandArgs[0].length + 1),
                    false,
                    msg.channel
                )
                .then(() => {
                    msg.delete();
                });
        } else {
            switch (command) {
                case "!insanity":
                    {
                        setSanity(parseFloat(commandArgs[1]));
                        sendWebhook(
                            "monsoon",
                            "yep donezo fonezo",
                            false,
                            msg.channel
                        );
                        break;
                    }
                case "!dalle2watermark":
                    dalle2watermark(msg, client);
                    break;
                case "!react":
                    {
                        if (!msg.reference) {
                            sendWebhook(
                                "flaps",
                                `reply to a message bub`,
                                false,
                                msg.channel
                            );
                        } else {
                            msg.fetchReference().then((m) => {
                                m.react(commandArgs[1]);
                            });
                        }
                        break;
                    }
                case "!badhaircut":
                    {
                        randomRedditImage("justfuckmyshitup", "haircut", msg);
                        break;
                    }
                case "!walmart":
                    {
                        randomRedditImage("peopleofwalmart", "walmart", msg);
                        break;
                    }
                case "!unfunny":
                    {
                        unfunnyTest(msg, client);
                        break;
                    }
                case "!meal":
                    {
                        randomRedditImage(
                            ["StupidFood", "ShittyFoodPorn"][
                                Math.floor(Math.random() * 2)
                            ],
                            "lamazzu",
                            msg
                        );
                        break;
                    }
                case "!restart":
                    {
                        flapslib.webhooks
                        .sendWebhook(
                            "flaps",
                            "goodbye cruel world <a:woeisgone:797896105488678922>",
                            true,
                            msg.channel
                        )
                        .then(() => {
                            process.exit(0);
                        });
                        break;
                    }
                case "!eval":
                    {
                        if (msg.author.id != "445968175381610496") {
                            flapslib.webhooks.sendWebhook(
                                "flaps",
                                "no.",
                                true,
                                msg.channel
                            );
                        } else {
                            try {
                                eval(commandArgString);
                            } catch (e) {
                                flapslib.webhooks.sendWebhook(
                                    "flapserrors",
                                    "fuck you. eval didnt work.\n" +
                                    e.toString(),
                                    true,
                                    msg.channel
                                );
                            }
                        }
                    }
                    break;
                case "!audio":
                    {
                        var validAudio = fs
                            .readFileSync("./audio/audiocommand.txt")
                            .toString()
                            .split("\r\n");
                        if (validAudio.includes(commandArgs[1].toLowerCase())) {
                            attachRecorder(
                                Object.keys(serverVCs).indexOf(msg.guild.id),
                                commandArgs[1].toLowerCase(),
                                msg.guild.id
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "flaps",
                                "that audio not real <a:woeisgone:959946980954636399>\naudios are:\n```ansi\n" +
                                validAudio.join("\n") +
                                "```",
                                true,
                                msg.channel
                            );
                        }
                    }
                    break;
                case "!yturl":
                    {
                        flapslib.yt.downloadYoutube(
                            Object.keys(serverVCs).indexOf(msg.guild.id),
                            commandArgs[1],
                            msg.channel,
                            commandArgs[2] == "-v",
                            attachRecorder
                        );
                    }
                    break;
                case "!loop":
                    {
                        var vc = Object.keys(serverVCs).indexOf(msg.guild.id);
                        if (loopingPlayers.includes(vc)) {
                            loopingPlayers = loopingPlayers.filter(
                                (p) => p != vc
                            );
                            sendWebhook(
                                "flaps",
                                "stopped looping current track",
                                false,
                                msg.channel
                            );
                        } else {
                            loopingPlayers.push(vc);
                            sendWebhook(
                                "flaps",
                                "looping current track",
                                false,
                                msg.channel
                            );
                        }
                    }
                    break;
                case "!watchparty":
                    {
                        flapslib.yt.startWatchParty(
                            commandArgs[1],
                            msg.channel
                        );
                    }
                    break;
                case "!wpadd":
                    {
                        flapslib.yt.wpAddToQueue(
                            commandArgs[2],
                            commandArgs[1],
                            msg.channel
                        );
                    }
                    break;
                case "!wptogglepause":
                    {
                        fetch(
                            "https://konalt.us.to:4930/pause/" + commandArgs[1]
                        )
                        .then((r) => r.json())
                        .then((response) => {
                            sendWebhook(
                                "flaps",
                                response.wp.paused ?
                                "paused da wath pary" :
                                "unpaused tha wathc parcht",
                                true,
                                msg.channel
                            );
                        });
                    }
                    break;
                case "!status":
                    {
                        var types = [
                            "PLAYING",
                            "STREAMING",
                            "COMPETING",
                            "LISTENING",
                            "WATCHING",
                        ];
                        var activityName = msg.content
                            .split(" ")
                            .slice(2)
                            .join(" ");
                        if (
                            commandArgs[1].toUpperCase() == "LISTENING" &&
                            commandArgs[2] == "to"
                        )
                            activityName = activityName
                            .split(" ")
                            .slice(1)
                            .join(" ");
                        if (types.includes(commandArgs[1].toUpperCase())) {
                            client.user.setPresence({
                                activities: [{
                                    name: activityName,
                                    type: commandArgs[1].toUpperCase(),
                                    url: "https://konalt.us.to",
                                    timestamps: {
                                        start: Date.now(),
                                    },
                                }, ],
                                afk: false,
                                status: "online",
                            });
                            fs.writeFileSync(
                                "./saved_status.txt",
                                commandArgs[1].toUpperCase() +
                                " " +
                                msg.content.split(" ").slice(2).join(" ")
                            );
                            flapslib.webhooks.sendWebhook(
                                "flaps",
                                "done",
                                false,
                                msg.channel
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "flaps",
                                "first argument must be one of these:\n```\n" +
                                types.join("\n") +
                                "\n```",
                                false,
                                msg.channel
                            );
                        }
                    }
                    break;
                case "!ytsearch":
                    {
                        flapslib.yt.downloadYoutube(
                            Object.keys(serverVCs).indexOf(msg.guild.id),
                            commandArgString,
                            msg.channel,
                            false,
                            attachRecorder
                        );
                    }
                    break;
                case "!markov":
                    {
                        flapslib.ai.markov2(commandArgString, 1, msg.channel);
                    }
                    break;
                case "!fornitesex":
                    {
                        fetch("https://www.reddit.com/r/fornitesex/about.json")
                        .then((r) => {
                            return r.json();
                        })
                        .then((r) => {
                            sendWebhook(
                                "flaps",
                                `r/fornitesex has ${r.data.subscribers} members! wowie!!`,
                                false,
                                msg.channel
                            );
                        });
                    }
                    break;
                case "!randompost":
                    {
                        fetch(
                            "https://www.reddit.com/" +
                            commandArgs[1] +
                            "/.json"
                        )
                        .then((r) => {
                            return r.json();
                        })
                        .then((r) => {
                            var child =
                                r.data.children[
                                    Math.floor(
                                        Math.random() *
                                        r.data.children.length
                                    )
                                ];
                            sendWebhook(
                                "flaps",
                                `https://www.reddit.com` +
                                child.data.permalink,
                                false,
                                msg.channel
                            );
                        });
                    }
                    break;
                case "!armstrong":
                    {
                        flapslib.ai.armstrong(
                            commandArgs[1] ? commandArgs[1] : 4,
                            msg.channel
                        );
                    }
                    break;
                case "!funnynumber":
                    {
                        var x = "";
                        if (commandArgs[1]) {
                            x = msg.content.split(" ").slice(1).join("_");
                        } else {
                            x = "hornet (hollow knight)".split(" ").join("_");
                        }
                        if (x.includes("child")) {
                            return sendWebhook(
                                "runcling",
                                "🚔🚔🚔🚔🚨🚨🚨🚨🚨🚓🚓🚓🚓👮‍♀️👮‍♂️👮‍♂️👮‍♂️👮‍♂️👮👮‍♂️👮‍♂️🚓🚨👮‍♀️👮‍♂️👮‍♀️🚓🚔🚨",
                                false,
                                msg.channel
                            );
                        }
                        fetch(
                            "https://rule34.xxx/public/autocomplete.php?q=" +
                            x.replace(/'/g, "&#039;"), {
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
                            }
                        )
                        .then((r) => {
                            return r.json();
                        })
                        .then((r) => {
                            var y = "";
                            if (!r[0]) {
                                sendWebhook(
                                    "runcling",
                                    "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude.",
                                    false,
                                    msg.channel
                                );
                            } else {
                                r = r.filter((z) =>
                                    z.label
                                    .replace(/&#039;/g, "'")
                                    .startsWith(x)
                                );
                                if (!r[0]) {
                                    return sendWebhook(
                                        "runcling",
                                        "holy fuck. you searched for something that even the horniest corner of the internet could not draw. good job dude.",
                                        false,
                                        msg.channel
                                    );
                                }
                                var data = {};
                                r.forEach((z) => {
                                    data[z.value] = parseInt(
                                        z.label.substring(
                                            z.value.length + 2,
                                            z.label.length - 1
                                        )
                                    );
                                });
                                console.log(data);
                                y = r
                                    .map((z) => {
                                        return (
                                            "**" +
                                            x +
                                            "**" +
                                            z.label
                                            .replace(/&#039;/g, "'")
                                            .substring(x.length)
                                            .replace(/_/g, "\\_") +
                                            " " +
                                            getComparisonEmoji(
                                                data[z.value],
                                                getStoredFunnyNumber(
                                                    z.value
                                                )
                                            )
                                        );
                                    })
                                    .join("\n");
                                storeFunnyNumberData(data);
                            }

                            sendWebhook("runcling", y, msg.channel);
                        });
                    }
                    break;
                case "!funnynumbers":
                    {
                        var chars = [
                            "calamitas",
                            "brimstone_elemental",
                            "loremaster_(helltaker)",
                            "nickygirl",
                            "nikku_(saruky)",
                            "hornet_(hollow_knight)",
                            "tasque_manager_(deltarune)",
                        ];
                        var out = "";
                        chars.forEach((element) => {
                            var x = element.split(" ").join("_");
                            fetch(
                                    "https://rule34.xxx/public/autocomplete.php?q=" +
                                    x, {
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
                                    }
                                )
                                .then((r) => r.text())
                                .then((r) => {
                                    return new Promise((res, rej) => {
                                        try {
                                            res([r, JSON.parse(r)]);
                                        } catch (e) {
                                            res([r, [{ label: e }]]);
                                        }
                                    });
                                })
                                .then((r) => {
                                    var y = "";
                                    if (!r[1]) {
                                        console.log("WHN !!?");
                                    } else {
                                        y =
                                            r[1][0].label.replace(/_/g, "\\_") +
                                            "\n";
                                        console.log(y.trim());
                                        out += y;
                                    }
                                    var done = true;
                                    chars.forEach((element2) => {
                                        if (!out.includes(
                                                element2.replace(/_/g, "\\_")
                                            )) {
                                            done = false;
                                        }
                                    });
                                    if (done) {
                                        sendWebhook(
                                            "runcling",
                                            out,
                                            false,
                                            msg.channel
                                        );
                                    }
                                })
                                .catch((e) => {
                                    console.log(e);
                                });
                        });
                    }
                    break;
                case "!countdown":
                    {
                        var endTime = new Date("2022-10-31T19:00:00Z");
                        endTime.setHours(endTime.getHours() - 1);
                        endTime = endTime.getTime();
                        var newTime = endTime - Date.now();
                        if (commandArgs[1] == "hour") {
                            return sendWebhook(
                                "flaps",
                                Math.floor(newTime / 1000 / 60 / 60) +
                                " hours left.",
                                false,
                                msg.channel
                            );
                        }

                        var delta = newTime / 1000;

                        var days = Math.floor(delta / 86400);
                        delta -= days * 86400;

                        var hours = Math.floor(delta / 3600) % 24;
                        delta -= hours * 3600;

                        var minutes = Math.floor(delta / 60) % 60;
                        delta -= minutes * 60;

                        var seconds = Math.round(delta % 60);

                        var str = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                        sendWebhook("flaps", str, msg.channel);
                    }
                    break;
                case "!coinflip":
                    sendWebhook(
                        "flaps",
                        Math.random() < 0.5 ? "heads" : "tails",
                        false,
                        msg.channel
                    );
                    break;
                case "!armstrong2":
                    {
                        flapslib.ai.armstrong2(msg.channel);
                    }
                    break;
                case "!oldmarkov":
                    {
                        flapslib.ai.markov(commandArgString, msg.channel);
                    }
                    break;
                case "!ytmp3":
                    {
                        flapslib.yt.downloadYoutubeToMP3(
                            commandArgString,
                            msg.channel,
                            commandArgs[2] == "-v",
                            client
                        );
                    }
                    break;
                case "!gif":
                    {
                        flapslib.videowrapper.addText(
                            "raiden",
                            commandArgString,
                            msg,
                            client
                        );
                    }
                    break;
                case "!imageaudio":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ".png",
                                () => {
                                    download(
                                        msg.attachments.first(2)[1].url,
                                        "./images/cache/" + id + ".mp3",
                                        () => {
                                            flapslib.videowrapper.imageAudio(
                                                id,
                                                msg,
                                                client
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!baitswitch":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            var a = msg.attachments.first(2)[1];
                            var b = msg.attachments.first();
                            //var largerW = (a.width > b.width) ? a.width : b.width;
                            //var largerH = (a.height > b.height) ? a.height : b.height
                            download(
                                b.url,
                                "./images/cache/" + id + ".png",
                                () => {
                                    download(
                                        a.url,
                                        "./images/cache/" + id + ".mp4",
                                        () => {
                                            flapslib.videowrapper.baitSwitch(
                                                id,
                                                msg,
                                                client, {
                                                    w: b.width,
                                                    h: b.height,
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!videoaudio":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ".mp4",
                                () => {
                                    download(
                                        msg.attachments.first(2)[1].url,
                                        "./images/cache/" + id + ".mp3",
                                        () => {
                                            flapslib.videowrapper.videoAudio(
                                                id,
                                                msg,
                                                client
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!stitch":
                    {
                        if (msg.attachments.first(2)[1]) {
                            var id = uuidv4().replace(/-/g, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ext,
                                () => {
                                    var id1 = uuidv4().replace(/-/g, "");
                                    var ext1 =
                                        "." +
                                        msg.attachments
                                        .first()
                                        .url.split(".")
                                        .pop();
                                    download(
                                        msg.attachments.first(2)[1].url,
                                        "./images/cache/" + id1 + ext1,
                                        () => {
                                            flapslib.videowrapper.stitch(
                                                [id + ext, id1 + ext1],
                                                msg,
                                                client
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!riggedcoinflip":
                    {
                        sendWebhook("flaps", "heads", msg.channel);
                    }
                    break;
                case "!geq":
                    {
                        if (msg.attachments.first()) {
                            var id = uuidv4().replace(/-/g, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.geq(id, msg, client);
                                }
                            );
                        } else {
                            flapslib.videowrapper.geq("nullsrc", msg, client);
                        }
                    }
                    break;
                case "!ffmpeg":
                    {
                        if (msg.attachments.first()) {
                            var id = uuidv4().replace(/-/g, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.complexFFmpeg(
                                        id,
                                        msg,
                                        client
                                    );
                                }
                            );
                        } else {
                            flapslib.videowrapper.complexFFmpeg(
                                "nullsrc",
                                msg,
                                client
                            );
                        }
                    }
                    break;
                case "!caption":
                    {
                        if (!msg.attachments.first()) {
                            if (!msg.reference) {
                                flapslib.webhooks.sendWebhook(
                                    "ffmpeg",
                                    "i cant caption nothing you dummy",
                                    false,
                                    msg.channel, {},
                                    msg
                                );
                            } else {
                                msg.fetchReference().then((ref) => {
                                    var url = "invalid";
                                    if (!ref.attachments.first() &&
                                        ref.content.startsWith("https://")
                                    ) {
                                        url = ref.content;
                                    } else {
                                        url = ref.attachments.first().url;
                                    }
                                    if (url == "invalid") return;
                                    var ext = "." + url.split(".").pop();
                                    if (ext != ".png" && ext != ".jpg")
                                        flapslib.webhooks.sendWebhook(
                                            "ffmpeg",
                                            "got it bro. this might take a while tho",
                                            false,
                                            msg.channel, {},
                                            msg
                                        );
                                    var id = flapslib.ai
                                        .uuidv4()
                                        .replace(/-/gi, "");
                                    flapslib.download(
                                        url,
                                        "images/cache/" + id + ext,
                                        () => {
                                            console.log(id + ext);
                                            flapslib.videowrapper.simpleMemeCaption(
                                                id,
                                                commandArgString,
                                                ref,
                                                client,
                                                url
                                            );
                                        }
                                    );
                                });
                            }
                        } else {
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            if (ext != ".png" && ext != ".jpg")
                                flapslib.webhooks.sendWebhook(
                                    "ffmpeg",
                                    "got it bro. this might take a while tho",
                                    false,
                                    msg.channel, {},
                                    msg
                                );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    console.log(id + ext);
                                    flapslib.videowrapper.simpleMemeCaption(
                                        id,
                                        commandArgString,
                                        msg,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!caption2":
                    {
                        if (!msg.attachments.first()) {
                            if (!msg.reference) {
                                flapslib.webhooks.sendWebhook(
                                    "ffmpeg",
                                    "i cant caption nothing you dummy",
                                    false,
                                    msg.channel, {},
                                    msg
                                );
                            } else {
                                msg.fetchReference().then((ref) => {
                                    var url = "invalid";
                                    if (!ref.attachments.first() &&
                                        ref.content.startsWith("https://")
                                    ) {
                                        url = ref.content;
                                    } else {
                                        url = ref.attachments.first().url;
                                    }
                                    if (url == "invalid") return;
                                    var ext = "." + url.split(".").pop();
                                    if (ext != ".png" && ext != ".jpg")
                                        flapslib.webhooks.sendWebhook(
                                            "ffmpeg",
                                            "got it bro. this might take a while tho",
                                            false,
                                            msg.channel, {},
                                            msg
                                        );
                                    var id = flapslib.ai
                                        .uuidv4()
                                        .replace(/-/gi, "");
                                    flapslib.download(
                                        url,
                                        "images/cache/" + id + ext,
                                        () => {
                                            console.log(id + ext);
                                            flapslib.videowrapper.caption2(
                                                id,
                                                commandArgString,
                                                ref,
                                                url
                                            );
                                        }
                                    );
                                });
                            }
                        } else {
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            if (ext != ".png" && ext != ".jpg")
                                flapslib.webhooks.sendWebhook(
                                    "ffmpeg",
                                    "got it bro. this might take a while tho",
                                    false,
                                    msg.channel, {},
                                    msg
                                );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    console.log(id + ext);
                                    flapslib.videowrapper.caption2(
                                        id,
                                        commandArgString,
                                        msg,
                                        msg.attachments.first().url
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!squash":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "(die)[https://konalt.us.to/files/videos/memes/dep.mp4]",
                                false,
                                msg.channel, {},
                                msg
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "got it bro. this might take a while tho",
                                false,
                                msg.channel, {},
                                msg
                            );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.squash(
                                        id,
                                        msg,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!trim":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "(die)[https://konalt.us.to/files/videos/memes/dep.mp4]",
                                false,
                                msg.channel, {},
                                msg
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "got it bro. this might take a while tho",
                                false,
                                msg.channel, {},
                                msg
                            );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.trim(
                                        id, [commandArgs[1], commandArgs[2]],
                                        msg,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!videogif":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "(die)[https://konalt.us.to/files/videos/memes/dep.mp4]",
                                false,
                                msg.channel, {},
                                msg
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "got it bro. this might take a while tho",
                                false,
                                msg.channel, {},
                                msg
                            );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.videoGif(
                                        id,
                                        msg,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!compress":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "[<@489894082500493349>](https://konalt.us.to/files/videos/memes/findel.mp4)",
                                false,
                                msg.channel, {},
                                msg
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "got it bro. this might take a while tho",
                                false,
                                msg.channel, {},
                                msg
                            );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.compress(
                                        id,
                                        msg,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!stretch":
                    {
                        if (!msg.attachments.first()) {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "[<@489894082500493349>](https://konalt.us.to/files/videos/memes/findel.mp4)",
                                false,
                                msg.channel, {},
                                msg
                            );
                        } else {
                            flapslib.webhooks.sendWebhook(
                                "ffmpeg",
                                "got it bro. this might take a while tho",
                                false,
                                msg.channel, {},
                                msg
                            );
                            var id = flapslib.ai.uuidv4().replace(/-/gi, "");
                            var ext =
                                "." +
                                msg.attachments.first().url.split(".").pop();
                            flapslib.download(
                                msg.attachments.first().url,
                                "images/cache/" + id + ext,
                                () => {
                                    flapslib.videowrapper.stretch(
                                        id,
                                        msg,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!dream":
                    {
                        flapslib.ai.doDream(msg);
                    }
                    break;
                case "!txtgen":
                    {
                        flapslib.ai.txtgen(msg.channel);
                    }
                    break;
                case "!cah":
                    {
                        flapslib.cah(msg.channel);
                    }
                    break;
                case "!carbs":
                    {
                        carbs(msg, client, false);
                    }
                    break;
                case "!carbsfunny":
                    {
                        carbs(msg, client, true);
                    }
                    break;
                case "!<:owl:964880176355897374>":
                    {
                        flapslib.webhooks.sendWebhook(
                            "<:owl:964880176355897374>",
                            "<:owl:964880176355897374>",
                            true,
                            msg.channel
                        );
                    }
                    break;
                case "!3dtext":
                    {
                        flapslib.ai.threeDimensionalText(
                            commandArgString,
                            msg.channel,
                            msg,
                            client
                        );
                    }
                    break;
                case "!funnyvideo":
                    {
                        scalFunnyVideo(msg);
                    }
                    break;
                case "!weezer":
                    {
                        weezer(msg, client);
                    }
                    break;
                case "!calamitas":
                    {
                        var files = fs.readdirSync("E:/MBG/StuffAndThings/38/");
                        var chosenFile =
                            files[Math.floor(Math.random() * files.length)];
                        var filesize =
                            fs.statSync(
                                "E:/MBG/StuffAndThings/38/" + chosenFile
                            ).size /
                            (1024 * 1024);
                        if (filesize > 8) {
                            sendWebhook(
                                "scal",
                                "ohh my god thats such a fucking big file. i cant,,, upload.,,,, itt ohohohhnnggmggnhahdf. its " +
                                Math.round(filesize) +
                                " megabyte. fucking hell. thats what she said.",
                                false,
                                msg.channel
                            );
                        } else {
                            var message = await client.channels.cache
                                .get("956316856422137856")
                                .send({
                                    files: [{
                                        attachment: "E:/MBG/StuffAndThings/38/" +
                                            chosenFile,
                                    }, ],
                                });

                            sendWebhook(
                                "scal",
                                message.attachments.first().url,
                                false,
                                msg.channel
                            );
                        }
                    }
                    break;
                case "!millerswife":
                    {
                        var files = fs.readdirSync(
                            "E:/MBG/StuffAndThings/lormastur/"
                        );
                        var chosenFile =
                            files[Math.floor(Math.random() * files.length)];
                        var filesize =
                            fs.statSync(
                                "E:/MBG/StuffAndThings/lormastur/" + chosenFile
                            ).size /
                            (1024 * 1024);
                        if (Math.random() < 0) {
                            flapslib.videowrapper.armstrongify(
                                "E:/MBG/StuffAndThings/lormastur/" + chosenFile,
                                msg,
                                1,
                                client
                            );
                            return;
                        }
                        if (filesize > 8) {
                            sendWebhook(
                                "millerwife",
                                "*ugngnh* " +
                                Math.round(filesize) +
                                " megabyte~~~~~. ah.. uhn......",
                                false,
                                msg.channel
                            );
                        } else {
                            var message = await client.channels.cache
                                .get("956316856422137856")
                                .send({
                                    files: [{
                                        attachment: "E:/MBG/StuffAndThings/lormastur/" +
                                            chosenFile,
                                    }, ],
                                });

                            sendWebhook(
                                "millerwife",
                                message.attachments.first().url,
                                false,
                                msg.channel
                            );
                        }
                    }
                    break;
                case "!inspire":
                    {
                        fetch("https://inspirobot.me/api?generate=true", {
                            credentials: "omit",
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
                                Accept: "*/*",
                                "Accept-Language": "en-US,en;q=0.5",
                                "X-Requested-With": "XMLHttpRequest",
                                "Alt-Used": "inspirobot.me",
                                "Sec-Fetch-Dest": "empty",
                                "Sec-Fetch-Mode": "cors",
                                "Sec-Fetch-Site": "same-origin",
                            },
                            referrer: "https://inspirobot.me/",
                            method: "GET",
                            mode: "cors",
                        })
                        .then((r) => r.text())
                        .then((r) => {
                            var id = uuidv4();
                            download(
                                r,
                                "./images/cache/" + id + ".png",
                                () => {
                                    sendWebhookFile(
                                        "deepai",
                                        "./images/cache/" + id + ".png",
                                        false,
                                        msg.channel
                                    );
                                }
                            );
                        });
                    }
                    break;
                case "!nohorny":
                    {
                        var id = uuidv4().replace(/-/g, "");
                        if (msg.attachments.first().url.endsWith(".mp4")) {
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ".mp4",
                                () => {
                                    getVideoDurationInSeconds(
                                        "./images/cache/" + id + ".mp4"
                                    ).then((duration) => {
                                        console.log(duration);
                                        flapslib.videowrapper.armstrongify(
                                            id + ".mp4",
                                            msg,
                                            duration,
                                            client
                                        );
                                    });
                                }
                            );
                        } else {
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + id + ".png",
                                () => {
                                    flapslib.videowrapper.armstrongify(
                                        id + ".png",
                                        msg,
                                        1,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!fbifiles":
                    {
                        var date = new Date(
                            new Date().getTime() +
                            Math.random() *
                            (new Date(
                                    new Date().getFullYear() + 10,
                                    new Date().getMonth(),
                                    new Date().getDate()
                                ).getTime() -
                                new Date().getTime())
                        );
                        var dateStr = `${date.getDate()}/${
                            date.getMonth() + 1
                        }/${date.getFullYear()} at ${date
                            .getHours()
                            .toString()
                            .padStart(2, "0")}:${date
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")}:${date
                            .getSeconds()
                            .toString()
                            .padStart(2, "0")}`;
                        if (commandArgString == "<:owl:964880176355897374>") {
                            sendWebhook(
                                "fbi",
                                `that owl is FUCKING INVINCIBLE\nhttps://media.discordapp.net/attachments/838732607344214019/980236924994338846/unknown.png`,
                                false,
                                msg.channel
                            );
                        } else if (commandArgString == "miller") {
                            sendWebhook(
                                "fbi",
                                `MILLER IS A DICK FUCK MILLER (dont actually fuck miller, fuck his daughter instead)\nhttps://media.discordapp.net/attachments/882743320554643476/981644975815135362/miller1.PNG`,
                                false,
                                msg.channel
                            );
                        } else {
                            sendWebhook(
                                "fbi",
                                `oh shit. ${commandArgString} will die on ${dateStr}. death by ${flapslib.cahWhiteCard()}
fbi files on ${commandArgString}: ${
                                    msg.mentions.users.first()
                                        ? descriptions[
                                              msg.mentions.users.first().id
                                          ] + "\nhere's a file photo"
                                            ? descriptions[
                                                  msg.mentions.users.first().id
                                              ] + "\nhere's a file photo"
                                            : "[[Blank]]"
                                        : "[[Blank]]"
                                }`,
                                false,
                                msg.channel
                            );
                        }
                    }
                    break;
                case "!framephoto":
                    {
                        frame(msg, client);
                    }
                    break;
                case "!frame2":
                    {
                        frame2(msg, client);
                    }
                    break;
                case "!speechbubble":
                    {
                        sb(msg, client);
                    }
                    break;
                case "!mybeloved":
                    {
                        if (!msg.attachments.first() ||
                            !msg.attachments.first().width
                        ) {
                            sendWebhook(
                                "mkswt",
                                "GIVE ME AN IMAGE YOU DWANKIE",
                                false,
                                msg.channel
                            );
                        } else {
                            var filename = uuidv4() + ".png";
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + filename,
                                () => {
                                    flapslib.makesweet(
                                        commandArgString,
                                        filename,
                                        msg.channel,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!heartclose":
                    {
                        if (!msg.attachments.first() ||
                            !msg.attachments.first().width
                        ) {
                            sendWebhook(
                                "mkswt",
                                "GIVE ME AN IMAGE YOU DWANKIE",
                                false,
                                msg.channel
                            );
                        } else {
                            var filename = uuidv4() + ".png";
                            download(
                                msg.attachments.first().url,
                                "./images/cache/" + filename,
                                () => {
                                    flapslib.reverseMakesweet(
                                        commandArgString,
                                        filename,
                                        msg.channel,
                                        client
                                    );
                                }
                            );
                        }
                    }
                    break;
                case "!flip":
                    flip(msg, client);
                    break;
                case "!spotted":
                    spotted(msg, client);
                    break;
                case "!homodog":
                    homodog(msg, client);
                    break;
                case "!laugh":
                    laugh(msg, client);
                    break;
                case "!person":
                    flapslib.ai.person(msg.channel, client);
                    break;
                case "!upscale":
                    {
                        flapslib.ai.upscaleImage(msg, msg.channel, client);
                    }
                    break;
                case "!complete":
                    {
                        var text = msg.content.substring("!complete ".length);
                        var arrayshit = text.split(" ");
                        if (text.startsWith("-i")) {
                            var nextArr = [];
                            arrayshit.forEach((word) => {
                                if (word == "-i") return;
                                if (Math.random() < 0.2)
                                    word = (word + " ").repeat(
                                        Math.floor(Math.random() * 5) + 2
                                    );
                                if (swears.includes(word.toLowerCase()))
                                    word = (word + " ").repeat(
                                        Math.floor(Math.random() * 7) + 3
                                    );
                                word = word.toUpperCase();
                                nextArr.push(word);
                            });
                            text = nextArr.join(" ");
                        }
                        lastRequests[msg.author.id] = text;
                        flapslib.ai.autocompleteText(text, msg.channel);
                    }
                    break;
                case "!tti":
                    {
                        sendWebhook(
                            "deepai",
                            "i'm working on it",
                            false,
                            msg.channel
                        );
                        var text = msg.content.substring("!tti ".length);
                        lastRequests[msg.author.id] = text;
                        flapslib.ai.tti(text, msg.channel, client);
                    }
                    break;
                case "!statusideas":
                    {
                        var originalStatusIdeas = [
                            "they really played the shooting song in the woodwork room. two days later?",
                            "im gonna uhh smash a mug on the ground on june 3rd",
                            "MUG SMASHIG",
                            "me running away from the car i rigged to detonate",
                            "OMELETTES, JACK",
                            "38, hahaahah.e.. theeehee...",
                            "im gonna take 8 xannies",
                            "ima fucking murder my pain *swallows 50 nurofens*",
                        ];
                        var inputText = originalStatusIdeas.join("\n") + "\n";
                        sendWebhook(
                            "deepai",
                            "beep boop am thinking......",
                            false,
                            msg.channel
                        );
                        flapslib.ai.autocompleteText(
                            inputText,
                            msg.channel,
                            true
                        );
                    }
                    break;
                case "!call":
                    {
                        if (commandArgs[1] == "1-087-311-9823") {
                            sendWebhook(
                                "smallcock",
                                "https://cdn.discordapp.com/attachments/882743320554643476/983385178254741514/phone_call.mp3",
                                false,
                                msg.channel
                            );
                        }
                        break;
                    }
                case "!define":
                    {
                        if (commandArgs[1]) {
                            fetch(
                                    "https://api.dictionaryapi.dev/api/v2/entries/en/" +
                                    commandArgs[1]
                                )
                                .then((r) => {
                                    return r.json();
                                })
                                .then((r) => {
                                    var word = r[0];
                                    if (!word)
                                        return sendWebhook(
                                            "flaps",
                                            "thats not a word dummy",
                                            false,
                                            msg.channel
                                        );
                                    sendWebhook(
                                        "flaps",
                                        word.word +
                                        "\n**" +
                                        word.phonetic +
                                        "**\n" +
                                        word.meanings
                                        .map(
                                            (m) =>
                                            m.definitions[0]
                                            .definition
                                        )
                                        .join("\n"),
                                        false,
                                        msg.channel
                                    );
                                });
                        }
                    }
                    break;
                case "!bruno":
                    var files = fs.readdirSync("./images/bruno/");
                    var chosenFile =
                        files[Math.floor(Math.random() * files.length)];
                    var filesize =
                        fs.statSync("./images/bruno/" + chosenFile).size /
                        (1024 * 1024);
                    if (filesize > 8) {
                        sendWebhook(
                            "bruno",
                            "FUCKING STRS MAKING MY FILES " +
                            Math.round(filesize) +
                            " MEGABYTES",
                            false,
                            msg.channel
                        );
                    } else {
                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: "./images/bruno/" + chosenFile,
                                }, ],
                            });

                        sendWebhook(
                            "bruno",
                            message.attachments.first().url,
                            true,
                            msg.channel
                        );
                    }
                    break;
                case "!rps":
                    {
                        var input = commandArgString.toLowerCase();
                        var dicks = [
                            "nutsack",
                            "balls",
                            "testicles",
                            "dick",
                            "cock",
                        ];
                        var opts = ["rock", "paper", "scissors"];
                        var output = "error";
                        var winner = "error";
                        if (dicks.includes(input)) {
                            output = "scissors";
                            winner = "pain";
                        } else if (!opts.includes(input)) {
                            var cards = [cahWhiteCard(), cahWhiteCard()];
                            output = cards[0].substring(2, cards[0].length - 3);
                            winner = cards[1].substring(2, cards[1].length - 3);
                        } else {
                            output = randomFromArray(opts);
                            switch (output) {
                                case "scissors":
                                    if (input == "rock") {
                                        winner = input;
                                    } else if (input == "paper") {
                                        winner = output;
                                    } else {
                                        winner = "tie";
                                    }
                                    break;
                                case "rock":
                                    if (input == "paper") {
                                        winner = input;
                                    } else if (input == "scissors") {
                                        winner = output;
                                    } else {
                                        winner = "tie";
                                    }
                                    break;
                                case "paper":
                                    if (input == "scissors") {
                                        winner = input;
                                    } else if (input == "rock") {
                                        winner = output;
                                    } else {
                                        winner = "tie";
                                    }
                                    break;
                            }
                        }
                        input = input[0].toUpperCase() + input.substring(1);
                        output = output[0].toUpperCase() + output.substring(1);
                        winner = winner[0].toUpperCase() + winner.substring(1);
                        sendWebhook(
                            "rps",
                            `You chose **${input}**. I chose **${output}**. Winner: **${winner}**!`,
                            false,
                            msg.channel
                        );
                        break;
                    }
                case "!animethink":
                    animethink(msg, client);
                    break;
                case "!animethink2":
                    animethink2(msg, client);
                    break;
                case "!describe":
                    console.log("GHNGNNHNHNH");
                    describe(msg);
                    break;
                case "!dalle":
                    {
                        var x = "pigeons flying in city";
                        if (commandArgs[1]) x = commandArgString;
                        sendWebhook(
                            "dalle",
                            "im thinking.... beep blorp...",
                            false,
                            msg.channel
                        );
                        flapslib.ai.dalle(x).then((data) => {
                            if (!data.image)
                                return flapslib.webhooks.sendWebhook(
                                    "dalle",
                                    data.prompt,
                                    false,
                                    msg.channel
                                );
                            var c = canvas.createCanvas(768, 768);
                            var ctx = c.getContext("2d");
                            var x = 0;
                            var y = 0;
                            data.images.forEach((imgurl) => {
                                var img = new Image();
                                img.onload = () =>
                                    ctx.drawImage(img, x * 256, y * 256, 256, 256);
                                img.onerror = (err) => {
                                    throw err;
                                };
                                img.src = "data:image/jpeg;base64," + imgurl;
                                x += 1;
                                if (x == 3) {
                                    y++;
                                    x = 0;
                                }
                            });
                            var outID = uuidv4() + ".png";
                            fs.writeFile(
                                "./images/cache/" + outID,
                                Buffer.from(
                                    c.toDataURL("image/png").split(",")[1],
                                    "base64"
                                ),
                                async() => {
                                    var message = await client.channels.cache
                                        .get("956316856422137856")
                                        .send({
                                            files: [{
                                                attachment: __dirname +
                                                    "\\images\\cache\\" +
                                                    outID,
                                            }, ],
                                        });
                                    setTimeout(() => {
                                        fs.unlinkSync("./images/cache/" + outID);
                                    }, 10000);
                                    flapslib.webhooks.sendWebhook(
                                        "dalle",
                                        data.prompt +
                                        "\n" +
                                        message.attachments.first().url,
                                        false,
                                        msg.channel
                                    );
                                }
                            );
                        });
                        break;
                    }
                case "!3amgonewrong":
                    {
                        var originalTitles = [
                            "DO NOT ORDER FNAF HAPPY MEALS AT 3AM!!!! (THEY CAME AFTER US)",
                            "DO NOT WATCH JASON VOORHEES MOVIE AT 3 AM!! *HE CAME AFTER US*",
                            "CUTTING OPEN HAUNTED ENCANTO DOLL AT 3 AM!! (WHAT'S INSIDE?)",
                            "DO NOT WATCH MICKEY MOUSE LOST EPISODE AT 3 AM!! *HAUNTED*",
                            "DRONE CATCHES SONIC.EXE AND SHADOW RACING AT A TRACK AND FIELD!!",
                            "DO NOT MAKE SONIC 2 VOODOO DOLL AT 3 AM CHALLENGE!! (ACTUALLY WORKED)",
                            "DO NOT WATCH VENOM MOVIE AT 3 AM",
                            "DO NOT ORDER SONIC 2 HAPPY MEAL FROM MCDONALDS AT 3 AM!! (HE CAME AFTER US)",
                        ];
                        var inputText = originalTitles.join("\n") + "\n";
                        sendWebhook(
                            "deepai",
                            "beep boop am thinking......",
                            false,
                            msg.channel
                        );
                        flapslib.ai.autocompleteText(
                            inputText,
                            msg.channel,
                            true
                        );
                    }
                    break;
                case "!donotcall":
                    {
                        var white = cahWhiteCard().toUpperCase();
                        white = white.substring(2, white.length - 3);
                        sendWebhook(
                            "flaps",
                            `DO NOT CALL ${white} AT 3AM!!`,
                            false,
                            msg.channel
                        );
                    }
                    break;
                case "!whitecard":
                    {
                        var white = cahWhiteCard();
                        white = white.substring(2, white.length - 2);
                        sendWebhook("flaps", white, msg.channel);
                    }
                    break;
                case "!watermark":
                    {
                        watermark(msg, client);
                    }
                    break;
                case "!img":
                    {
                        var text = msg.content.substring("!img ".length);
                        textToImage(text, msg.guild.id);
                    }
                    break;
                case "!vs2":
                case "!vs":
                    versus(client, msg);
                    break;
                case "!r34comments":
                case "!r34commentsvideo":
                case "!r34video":
                case "!r34":
                    {
                        if (Math.random() < 0.125) {
                            return sendWebhook(
                                "welldressed",
                                "https://media.discordapp.net/attachments/956316856422137856/982985131151228928/88324f31a1fe4aa3a4568285e8771de6.png",
                                false,
                                msg.channel
                            );
                        }
                        var x = "";
                        if (commandArgs[1]) {
                            x = msg.content.split(" ").slice(1).join("_");
                        } else {
                            x = "hornet (hollow knight)".split(" ").join("_");
                        }
                        x = x.replace(/,/g, " ");
                        if (
                            x.includes("child") ||
                            x.includes("hat_kid") ||
                            x.includes("a_hat")
                        ) {
                            return sendWebhook(
                                "runcling",
                                "🚔🚔🚔🚔🚨🚨🚨🚨🚨🚓🚓🚓🚓👮‍♀️👮‍♂️👮‍♂️👮‍♂️👮‍♂️👮👮‍♂️👮‍♂️🚓🚨👮‍♀️👮‍♂️👮‍♀️🚓🚔🚨",
                                false,
                                msg.channel
                            );
                        }
                        fetch(
                            "https://rule34.xxx/public/autocomplete.php?q=" +
                            x.replace(/'/g, "&#039;"), {
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
                            }
                        )
                        .then((ra) => {
                            return ra.json();
                        })
                        .then((ra) => {
                            if (!ra[0] && !x.includes(" ")) {
                                return sendWebhook(
                                    "runcling",
                                    "go outside horny runcling\nhttps://media.discordapp.net/attachments/882743320554643476/982983490075254784/unknown.png",
                                    false,
                                    msg.channel
                                );
                            }
                            console.log(x);
                            console.log(
                                ra.map((z) =>
                                    z.label.replace(/&#039;/g, "'")
                                )
                            );
                            ra = ra.filter((z) =>
                                z.label
                                .replace(/&#039;/g, "'")
                                .startsWith(x)
                            );
                            if (!ra[0]) {
                                return sendWebhook(
                                    "runcling",
                                    "go inside horny runcling\n😫8====✊===D💦💦",
                                    false,
                                    msg.channel
                                );
                            }
                            fetch(
                                    "https://rule34.xxx/index.php?page=post&s=list&tags=" +
                                    (x.includes(" ") ? x : ra[0].value)
                                )
                                .then((r) => {
                                    return r.text();
                                })
                                .then((r) => {
                                    if (!r.split(
                                            '<div class="image-list">'
                                        )[1]) {
                                        return sendWebhook(
                                            "runcling",
                                            "go outside horny runcling\nhttps://media.discordapp.net/attachments/882743320554643476/982983490075254784/unknown.png",
                                            false,
                                            msg.channel
                                        );
                                    }
                                    var list = r
                                        .split(
                                            '<div class="image-list">'
                                        )[1]
                                        .split('<div id="paginator">')[0]
                                        .split(
                                            /<\/a>\n<\/span>\n<span id="s[0-9]*" class="thumb">\n<a id="p[0-9]*" href="[A-z\.\&\?\=0-9]*" style="">/gi
                                        );
                                    list = list.filter((item) => {
                                        return (
                                            item.startsWith("\n<img s") &&
                                            (command.includes("video") ?
                                                item.includes(
                                                    "border: 3px solid #0000ff;"
                                                ) :
                                                true)
                                        );
                                    });

                                    list = list.map((item) => {
                                        return [
                                            item.substring(
                                                '<img src="'.length + 1,
                                                "https://wimg.rule34.xxx/thumbnails/5074/thumbnail_d3b24d47c2ac59b0c0f2d04319ec240e.jpg?5784441"
                                                .length +
                                                '<img src="'.length +
                                                1
                                            ),
                                            item.includes(
                                                "border: 3px solid #0000ff;"
                                            ),
                                        ];
                                    });
                                    list = list.map((item) => {
                                        return [
                                            item[0].replace(
                                                /thumbnail/g,
                                                "sample"
                                            ),
                                            item[1],
                                        ];
                                    });
                                    console.log(used);

                                    if (
                                        list.filter((item) => {
                                            return !used.includes(item[0]);
                                        }).length == 0 &&
                                        list.length > 0
                                    )
                                        used = [];

                                    list = list.filter((item) => {
                                        return !used.includes(item[0]);
                                    });
                                    console.log(list);
                                    var item = randomFromArray(list);
                                    var id = uuidv4() + ".jpg";
                                    if (!item) {
                                        return sendWebhook(
                                            "runcling",
                                            "go outside horny runcling\nhttps://media.discordapp.net/attachments/882743320554643476/982983490075254784/unknown.png",
                                            false,
                                            msg.channel
                                        );
                                    }
                                    used.push(item[0]);
                                    var isVideoStr = item[1] ?
                                        "Video: YES" :
                                        "Video: NO";
                                    if (
                                        item[1] &&
                                        command.includes("video")
                                    ) {
                                        id = uuidv4() + ".mp4";
                                        var videoURL =
                                            "https://ws-cdn-video.rule34.xxx/images/" +
                                            item[0].split("/")[4] +
                                            "/" +
                                            item[0]
                                            .split("_")[1]
                                            .replace(
                                                /(png|jpe*g)/g,
                                                "mp4"
                                            );
                                        download(
                                            videoURL,
                                            "images/cache/" + id,
                                            async(err) => {
                                                getR34Comments(
                                                    item[0].split("?")[1]
                                                ).then((comments) => {
                                                    if (!command.includes(
                                                            "comments"
                                                        ))
                                                        comments = "";
                                                    sendWebhookFile(
                                                        "runcling",
                                                        __dirname +
                                                        "\\images\\cache\\" +
                                                        id,
                                                        msg.channel, {},
                                                        comments +
                                                        "\n" +
                                                        isVideoStr,
                                                        () => {
                                                            // this has to be the WORST FUCKING HACK
                                                            compress(
                                                                id.split(
                                                                    "."
                                                                )[0], {
                                                                    attachments: {
                                                                        first: () => {
                                                                            return {
                                                                                url: id,
                                                                            };
                                                                        },
                                                                    },
                                                                    channel: msg.channel,
                                                                }
                                                            );
                                                        }
                                                    );
                                                });
                                            }
                                        );
                                    } else {
                                        download(
                                            item[0],
                                            "images/cache/" + id,
                                            async(err) => {
                                                if (err) {
                                                    console.log(
                                                        "ERROR WEEWOOWOOEOEOWEO"
                                                    );
                                                    return download(
                                                        item[0].replace(
                                                            /sample/g,
                                                            "thumbnail"
                                                        ),
                                                        "images/cache/" +
                                                        id,
                                                        async(err) => {
                                                            var message =
                                                                await client.channels.cache
                                                                .get(
                                                                    "956316856422137856"
                                                                )
                                                                .send({
                                                                    files: [{
                                                                        attachment: __dirname +
                                                                            "\\images\\cache\\" +
                                                                            id,
                                                                    }, ],
                                                                });

                                                            setTimeout(
                                                                () => {
                                                                    fs.unlinkSync(
                                                                        "./images/cache/" +
                                                                        id
                                                                    );
                                                                },
                                                                10000
                                                            );

                                                            getR34Comments(
                                                                item[0].split(
                                                                    "?"
                                                                )[1]
                                                            ).then(
                                                                (
                                                                    comments
                                                                ) => {
                                                                    if (!command.includes(
                                                                            "comments"
                                                                        ))
                                                                        comments =
                                                                        "";
                                                                    sendWebhook(
                                                                        "runcling",
                                                                        comments +
                                                                        "\n" +
                                                                        isVideoStr +
                                                                        "\n" +
                                                                        message.attachments.first()
                                                                        .url,
                                                                        false,
                                                                        msg.channel
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                                var message =
                                                    await client.channels.cache
                                                    .get(
                                                        "956316856422137856"
                                                    )
                                                    .send({
                                                        files: [{
                                                            attachment: __dirname +
                                                                "\\images\\cache\\" +
                                                                id,
                                                        }, ],
                                                    });

                                                setTimeout(() => {
                                                    fs.unlinkSync(
                                                        "./images/cache/" +
                                                        id
                                                    );
                                                }, 10000);

                                                getR34Comments(
                                                    item[0].split("?")[1]
                                                ).then((comments) => {
                                                    if (!command.includes(
                                                            "comments"
                                                        ))
                                                        comments = "";
                                                    sendWebhook(
                                                        "runcling",
                                                        comments +
                                                        "\n" +
                                                        message.attachments.first()
                                                        .url,
                                                        false,
                                                        msg.channel
                                                    );
                                                });
                                            }
                                        );
                                    }
                                });
                        });
                    }
                    break;
                case "!basedmeter":
                    {
                        flapslib.webhooks.sendWebhook(
                            "based",
                            "https://media.discordapp.net/attachments/882743320554643476/929056031101833216/IlphMLX5ggUAAAAASUVORK5CYII.png",
                            false,
                            msg.channel
                        );
                    }
                    break;
                case "!degeneracy":
                    {
                        flapslib.fetchapis.roulette(msg.channel);
                    }
                    break;
                case "!owo":
                    sendWebhook(
                        "ghost",
                        owoify(commandArgString, "uvu"),
                        false,
                        msg.channel
                    );
                    break;
                case "!yougoodslime":
                    sendWebhook("flaps", "im ok slime!", msg.channel);
                    break;
                case "!flapslength":
                    {
                        var lines = fs
                            .readFileSync("./main.js")
                            .toString()
                            .split("\r\n").length;
                        var lengths = {
                            "main.js": parseInt(lines.toString()),
                        };
                        fs.readdir("./flapslib", (err, files) => {
                            files.forEach((file) => {
                                var l = fs
                                    .readFileSync("./flapslib/" + file)
                                    .toString()
                                    .split("\r\n").length;
                                lines += l;
                                lengths[file] = l;
                            });
                            fs.readdir(
                                "E:/MBG/2site/sites/konalt/flaps/watchparty/videos",
                                (err, files) => {
                                    var flapsCacheFilesize = 0;
                                    files.forEach((file) => {
                                        var stats = fs.statSync(
                                            "E:/MBG/2site/sites/konalt/flaps/watchparty/videos/" +
                                            file
                                        );
                                        var fileSizeInBytes = stats.size;
                                        var fileSizeInMegabytes =
                                            fileSizeInBytes / (1024 * 1024);
                                        flapsCacheFilesize +=
                                            fileSizeInMegabytes;
                                    });
                                    flapsCacheFilesize =
                                        Math.round(flapsCacheFilesize * 10) /
                                        10;
                                    flapslib.webhooks.sendWebhook(
                                        "flaps",
                                        "i grow to " +
                                        lines +
                                        " lines.\nFlapsCache:tm: total size taken: " +
                                        flapsCacheFilesize +
                                        "MB\nbreakdown:\n" +
                                        Object.entries(lengths)
                                        .sort((a, b) => {
                                            return b[1] - a[1];
                                        })
                                        .map((x) => {
                                            return (
                                                x[0] +
                                                ": " +
                                                x[1] +
                                                " lines"
                                            );
                                        })
                                        .join("\n"),
                                        false,
                                        msg.channel
                                    );
                                }
                            );
                        });
                    }
                    break;
                case "!petit":
                    {
                        try {
                            await fetch("https://petittube.com/index.php", {
                                    credentials: "omit",
                                    headers: {
                                        "User-Agent": "FlapsChelton",
                                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                                        "Accept-Language": "en-US,en;q=0.5",
                                        "Upgrade-Insecure-Requests": "1",
                                        "Sec-Fetch-Dest": "document",
                                        "Sec-Fetch-Mode": "navigate",
                                        "Sec-Fetch-Site": "same-origin",
                                        "Cache-Control": "max-age=0",
                                    },
                                    method: "GET",
                                    mode: "cors",
                                })
                                .then((r) => r.text())
                                .then((content) => {
                                    var a = content.substring(
                                        content.indexOf(
                                            "https://www.youtube.com/embed/"
                                        ) +
                                        "https://www.youtube.com/embed/"
                                        .length,
                                        content.indexOf(
                                            "https://www.youtube.com/embed/"
                                        ) +
                                        "https://www.youtube.com/embed/"
                                        .length +
                                        11
                                    );
                                    console.log(a);
                                    flapslib.webhooks.sendWebhook(
                                        "deepai",
                                        "https://youtube.com/watch?v=" + a,
                                        false,
                                        msg.channel
                                    );
                                });
                        } catch (e) {
                            console.log("aw");
                            console.log(e);
                        }
                    }
                    break;
                case "!help":
                    {
                        var f = "flaps chelton help:\n";
                        Object.entries(commands).forEach((x) => {
                            f += `${x[0]}: ${x[1]}\n`;
                        });
                        flapslib.webhooks.sendWebhook(
                            "flaps",
                            f,
                            false,
                            msg.channel, {},
                            msg
                        );
                    }
                    break;
                case "!balkancuisine":
                    {
                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: "images/ciggies/" +
                                        Math.floor(Math.random() * 17) +
                                        ".jpg",
                                }, ],
                            });

                        flapslib.webhooks.sendWebhook(
                            "balkan",
                            message.attachments.first().url,
                            false,
                            msg.channel
                        );
                    }
                    break;
                case "!methrecipe":
                    {
                        flapslib.webhooks.sendWebhook(
                            "flaps",
                            "https://cdn.discordapp.com/attachments/956316856422137856/993527069185151047/meth.mp4",
                            false,
                            msg.channel
                        );
                    }
                    break;
                case "!translate":
                    {
                        var n = parseInt(commandArgs[1]) ?
                            parseInt(commandArgs[1]) :
                            10;
                        var t = parseInt(commandArgs[1]) ?
                            commandArgs.slice(2).join(" ") :
                            commandArgString;
                        sendWebhook(
                            "flaps",
                            "woo we translatin baby",
                            false,
                            msg.channel
                        );
                        var translated = await doTranslate(t, n);
                        sendWebhook("flaps", translated, msg.channel);
                        break;
                    }
                case "!translate2":
                    {
                        var n = 5;
                        var t = commandArgString;
                        sendWebhook(
                            "flaps",
                            "woo we translatin baby",
                            false,
                            msg.channel
                        );
                        var o = await doTranslateSending(t, n);
                        sendWebhook("flaps", o, msg.channel);
                        break;
                    }
                case "!funnycat":
                    {
                        var message = await client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: "images/cybercat.jpg",
                                }, ],
                            });

                        flapslib.webhooks.sendWebhook(
                            "balkan",
                            message.attachments.first().url,
                            false,
                            msg.channel
                        );
                    }
                    break;
                case "!morbius":
                    {
                        flapslib.moviereview.morbiusReview(msg.channel);
                    }
                    break;
                case "!cnv":
                    {
                        if (canvases[msg.author.id]) {
                            var mc_c = canvases[msg.author.id];
                            var mc = mc_c.getContext("2d");
                            var a = parseInt(commandArgs[2]) ?
                                parseInt(commandArgs[2]) :
                                commandArgs[2];
                            var b = parseInt(commandArgs[3]) ?
                                parseInt(commandArgs[3]) :
                                commandArgs[3];
                            var c = parseInt(commandArgs[4]) ?
                                parseInt(commandArgs[4]) :
                                commandArgs[4];
                            var d = parseInt(commandArgs[5]) ?
                                parseInt(commandArgs[5]) :
                                commandArgs[5];
                            var send = true;
                            switch (commandArgs[1]) {
                                case "rect":
                                    mc.fillRect(a, b, c, d);
                                    break;
                                case "clear":
                                    mc.clearRect(0, 0, 1000, 1000);
                                    break;
                                case "setcol":
                                    mc.fillStyle = a;
                                    send = false;
                                    break;
                                default:
                                    send = true;
                                    break;
                            }
                            if (send) {
                                console.log("the best pigon");
                                var imgID = uuidv4().replace(/-/g, "_") + ".png";
                                var imageStream = Buffer.from(
                                    mc_c.toDataURL("image/png").split(",")[1],
                                    "base64"
                                );
                                fs.writeFileSync(
                                    "./images/cache/" + imgID,
                                    imageStream
                                );

                                console.log(
                                    __dirname + "\\images\\cache\\" + imgID
                                );
                                /**
                                 * @type {Discord.Message}
                                 */
                                client.channels.cache
                                    .get("956316856422137856")
                                    .send({
                                        files: [{
                                            attachment: __dirname +
                                                "\\images\\cache\\" +
                                                imgID,
                                        }, ],
                                    })
                                    .then((message) => {
                                        setTimeout(() => {
                                            fs.unlinkSync(
                                                "./images/cache/" + imgID
                                            );
                                        }, 10000);

                                        flapslib.webhooks.sendWebhook(
                                            "flaps",
                                            message.attachments.first().url,
                                            false,
                                            msg.channel
                                        );
                                    });
                            }
                        } else {
                            canvases[msg.author.id] = createCanvas(1000, 1000);
                            sendWebhook(
                                "flaps",
                                "yer canvas has been created!!!",
                                msg.channel
                            );
                        }
                        break;
                    }
                case "!buttontest":
                    {
                        sendWebhookButton(
                            "flaps",
                            "Button test shit", [{
                                    type: 2,
                                    label: "Test button 1",
                                    id: "cheltontest1",
                                    style: 1,
                                    cb: (i) => {
                                        sendWebhook(
                                            "flaps",
                                            "royal republic button 1",
                                            i.channel
                                        );
                                    },
                                },
                                {
                                    type: 2,
                                    label: "Test button 2",
                                    id: "cheltontest2",
                                    style: 2,
                                    cb: (i) => {
                                        sendWebhook(
                                            "flaps",
                                            "royal republic button 2!!>??!",
                                            i.channel
                                        );
                                    },
                                },
                            ],
                            msg.channel
                        );
                        break;
                    }
                case "!c":
                    {
                        sendToChatbot(commandArgString, (text) => {
                            sendWebhook("sammy", text, msg.channel);
                        });
                        break;
                    }
                case "!southerner":
                    var str = `the best part
                        about meatballs
                        is that poor people cannot make them
                        poor people only get
                        malt liqour
                        cool aid
                        and shitty fried chicken
                        that looks like a nice meatball
                        not that a poor man would know
                        ha ha`;
                    sendWebhook("southerner", str, msg.channel);
                    break;
                case "!question":
                    question(commandArgString, msg.channel);
                    break;
                case "!gpt3complete":
                    gpt3complete(commandArgString, msg.channel);
                    break;
                case "!monsoonswitch":
                    switchMode(msg.channel);
                    break;
                case "!elcomplete":
                    elcomplete(commandArgString, msg.channel, 1);
                    break;
                case "!mimenod":
                    if (!parseInt(commandArgs[1]))
                        return sendWebhook(
                            "ffmpeg",
                            "argument must be a number (bpm)",
                            false,
                            msg.channel
                        );
                    flapslib.videowrapper.mimeNod(
                        parseInt(commandArgs[1]),
                        msg
                    );
                    break;
                case "!gifaudio":
                    if (msg.attachments.first(2)[1]) {
                        var id = uuidv4().replace(/-/g, "");
                        download(
                            msg.attachments.first().url,
                            "./images/cache/" + id + ".gif",
                            () => {
                                download(
                                    msg.attachments.first(2)[1].url,
                                    "./images/cache/" + id + ".mp3",
                                    () => {
                                        flapslib.videowrapper.gifAudio(
                                            id,
                                            msg,
                                            client
                                        );
                                    }
                                );
                            }
                        );
                    }
                    break;
                case "!retry":
                    if (!msg.reference) {
                        return sendWebhook(
                            "flaps",
                            "reply to a message bub",
                            msg.channel
                        );
                    }
                    msg.fetchReference().then((ref) => {
                        onMessage(ref);
                    });
            }
            if (toDelete) {
                msg.delete();
            }
        }
    } catch (err) {
        flapslib.webhooks.sendWebhook(
            "flapserrors",
            "Oooops! Looks like flaps broke.\n<@445968175381610496>, here's the scoop:\n" +
            err.stack,
            false,
            msg.channel
        );
    }
}

client.on("messageCreate", onMessage);

setInterval(() => {
    var d = new Date();
    if (
        d.getMinutes() == 33 &&
        d.getHours() == 23 &&
        d.getFullYear() == 2033 &&
        d.getMonth() == 2 &&
        d.getDate() == 3
    ) {
        console.log(
            d.getMinutes(),
            d.getHours(),
            d.getFullYear(),
            d.getMonth(),
            d.getDate()
        );
        sendWebhook(
            "flaps",
            "@everyone R.I.P. FUNKY TOWN\n IT'S 3/3/33 23:33 THO YA FUCKIN DONGS!!!!!",
            false,
            client.channels.cache.get("882743320554643476")
        );
    }
}, 1000);
setInterval(() => {
    var d = new Date();
    if (d.getMinutes() == 0 && d.getHours() == 0 && d.getSeconds() < 1) {
        sendWebhook(
            "flaps",
            "midnight",
            false,
            client.channels.cache.get("882743320554643476")
        );
    }
    if (
        d.getMinutes() == 39 &&
        d.getSeconds() < 1 &&
        fs.readFileSync("scal_allowtime.txt") == "yes"
    ) {
        fs.writeFileSync("scal_allowtime.txt", "no");
        sendWebhook(
            "scal",
            "TIME\nHAHAHAHH",
            false,
            client.channels.cache.get("882743320554643476")
        );
    }
}, 1000);

/**
 *
 * @param {Discord.ButtonInteraction} i
 */
function respondToInteraction(i) {
    fetch(
        "https://discord.com/api/v10/interactions/" +
        i.id +
        "/" +
        i.token +
        "/callback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: 6,
            }),
        }
    );
    if (flapslib.webhooks.buttonCallbacks[i.customId]) {
        flapslib.webhooks.buttonCallbacks[i.customId](i);
    }
}

client.on("interactionCreate", (i) => {
    respondToInteraction(i);
});

fs.readFile("./token.txt", (err, data) => {
    if (err) {
        console.error(err);
    } else {
        client.login(data.toString());
    }
});

flapslib.watchparty_init(client);
flapslib.videowrapper.setClient(client);